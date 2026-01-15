import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import {
  APPLICATION_COLLECTION_NAME,
  ApplicationEntity,
  ApplicationStatus,
} from '../../entities/application.entity';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UpdateApplicationDetailsDto } from './dto/update-application.dto';
import { FilterApplicationDto } from './dto/filter-application.dto';
import { CV_COLLECTION_NAME, CvEntity } from '../../entities/cv.entity';
import { JOB_COLLECTION_NAME, JobEntity } from '../../entities/job.entity';

@Injectable()
export class ApplicationService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async updateStatus(id: string, dto: UpdateApplicationStatusDto) {
    const docRef = this.firebaseService.firestore
      .collection(APPLICATION_COLLECTION_NAME)
      .doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng tuyển');
    }

    const currentApp = ApplicationEntity.fromFirestore(doc);
    const oldStatus = currentApp.status as ApplicationStatus;
    const newStatus = dto.status;

    // Trạng thái mới và cũ trùng nhau
    if (oldStatus === newStatus) {
      throw new BadRequestException(
        `Hồ sơ đã ở trạng thái ${newStatus} rồi, không cần cập nhật.`,
      );
    }

    // Kiểm tra luồng đi
    this.validateStatusTransition(oldStatus, newStatus);

    // Nếu REJECTED thì bắt buộc có lý do
    if (newStatus === ApplicationStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException(
        'Vui lòng nhập lý do từ chối khi cập nhật trạng thái REJECTED.',
      );
    }

    // Chuẩn bị dữ liệu update
    const updates: any = {
      status: newStatus,
      updatedAt: new Date(),
    };

    if (dto.rejectionReason && newStatus === ApplicationStatus.REJECTED) {
      updates.rejectionReason = dto.rejectionReason;
    }

    await docRef.update(updates);

    return {
      id,
      oldStatus,
      newStatus,
      message: 'Cập nhật trạng thái thành công',
    };
  }

  async updateDetails(id: string, dto: UpdateApplicationDetailsDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Không có dữ liệu nào để cập nhật');
    }
    const docRef = this.firebaseService.firestore
      .collection(APPLICATION_COLLECTION_NAME)
      .doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng tuyển');
    }

    // Chỉ map các field có gửi lên
    const updates: any = { updatedAt: new Date() }; // Luôn cập nhật updatedAt

    if (dto.interviewScheduled)
      updates.interviewScheduled = new Date(dto.interviewScheduled);
    if (dto.feedback !== undefined) updates.feedback = dto.feedback;
    if (dto.rating !== undefined) updates.rating = dto.rating;
    if (dto.rejectionReason !== undefined)
      updates.rejectionReason = dto.rejectionReason;

    await docRef.update(updates);

    return { id, message: 'Cập nhật thông tin thành công' };
  }

  async findAllByJob(jobId: string, filter: FilterApplicationDto) {
    const { page = 1, limit = 10, status } = filter;
    const offset = (page - 1) * limit;

    let query = this.firebaseService.firestore
      .collection(APPLICATION_COLLECTION_NAME)
      .where('jobId', '==', jobId);

    if (status) {
      query = query.where('status', '==', status);
    }

    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    query = query.orderBy('appliedAt', 'desc').offset(offset).limit(limit);
    const snapshot = await query.get();

    if (snapshot.empty) {
      return { data: [], meta: { total, page, limit, totalPages: 0 } };
    }

    //Lấy danh sách Application Entity
    const applications = snapshot.docs.map((doc) =>
      ApplicationEntity.fromFirestore(doc),
    );

    //Lấy danh sách CV ID để query một lần (Batch Get)
    //Filter các cvId trùng hoặc null để tránh lỗi
    const cvIds = [
      ...new Set(applications.map((app) => app.cvId).filter((id) => id)),
    ];

    let cvMap: Record<string, any> = {};

    if (cvIds.length > 0) {
      // Tạo mảng Document References
      const cvRefs = cvIds.map((id) =>
        this.firebaseService.firestore.collection(CV_COLLECTION_NAME).doc(id),
      );

      // getAll: Tối ưu hơn việc gọi Promise.all(get) từng cái
      const cvSnapshots = await this.firebaseService.firestore.getAll(
        ...cvRefs,
      );

      // Tạo Map để tra cứu nhanh: { "cv_id_1": { name: "...", ... } }
      cvSnapshots.forEach((snap) => {
        if (snap.exists) {
          const cvData = CvEntity.fromFirestore(snap); // Lấy raw data
          // Chỉ lấy các trường cần thiết để hiển thị
          cvMap[snap.id] = {
            cvId: snap.id,
            fullName: cvData.fullName,
            email: cvData.email,
            phone: cvData.phone,
            cvFileUrl: cvData.cvFileUrl,
            position: cvData.position,
            experienceYears: cvData.experienceYears,
          };
        }
      });
    }

    // 3. Map thông tin CV vào Application
    const data = applications.map((app) => {
      const { cvId, jobId, ...appData } = app;
      return {
        ...appData,
        cv: cvMap[app.cvId] || null, // Gắn object CV vào (hoặc null nếu CV đã bị xóa)
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllByCv(cvId: string, filter: FilterApplicationDto) {
    const { page = 1, limit = 10, status } = filter;
    const offset = (page - 1) * limit;

    // Query Application theo cvId
    let query = this.firebaseService.firestore
      .collection(APPLICATION_COLLECTION_NAME)
      .where('cvId', '==', cvId);

    if (status) {
      query = query.where('status', '==', status);
    }

    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    // Cần Index: (cvId ASC, appliedAt DESC)
    query = query.orderBy('appliedAt', 'desc').offset(offset).limit(limit);
    const snapshot = await query.get();

    if (snapshot.empty) {
      return { data: [], meta: { total, page, limit, totalPages: 0 } };
    }

    const applications = snapshot.docs.map((doc) =>
      ApplicationEntity.fromFirestore(doc),
    );

    // 1. Lấy danh sách Job ID
    const jobIds = [
      ...new Set(applications.map((app) => app.jobId).filter((id) => id)),
    ];
    let jobMap: Record<string, any> = {};

    if (jobIds.length > 0) {
      const jobRefs = jobIds.map((id) =>
        this.firebaseService.firestore.collection(JOB_COLLECTION_NAME).doc(id),
      );

      const jobSnapshots = await this.firebaseService.firestore.getAll(
        ...jobRefs,
      );

      jobSnapshots.forEach((snap) => {
        if (snap.exists) {
          const jobData = JobEntity.fromFirestore(snap);
          // Chỉ lấy trường cần thiết của Job
          jobMap[snap.id] = {
            id: snap.id,
            name: jobData.name, // Tên Job
            status: jobData.status, // Trạng thái Job (Open/Closed)
            applyEnd: jobData.applyEnd, // Hạn nộp
            headcountTarget: jobData.headcountTarget,
            headcountHired: jobData.headcountHired
          };
        }
      });
    }

    // 2. Map thông tin Job vào kết quả
    const data = applications.map((app) => {
      const { cvId, jobId, ...appData } = app;
      return {
        ...appData,
        job: jobMap[app.jobId] || null,
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const docRef = this.firebaseService.firestore
      .collection(APPLICATION_COLLECTION_NAME)
      .doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng tuyển');
    }

    const app = ApplicationEntity.fromFirestore(doc);

    // Fetch thông tin CV và Job song song
    const [cvSnap, jobSnap] = await Promise.all([
      this.firebaseService.firestore
        .collection(CV_COLLECTION_NAME)
        .doc(app.cvId)
        .get(),
      this.firebaseService.firestore
        .collection(JOB_COLLECTION_NAME)
        .doc(app.jobId)
        .get(),
    ]);

    let cvData;
    if (cvSnap.exists) {
      const d = CvEntity.fromFirestore(cvSnap);
      cvData = {
        id: cvSnap.id,
        fullName: d.fullName,
        email: d.email,
        phone: d.phone,
        cvFileUrl: d.cvFileUrl,
        position: d.position,
        experienceYears: d.experienceYears,
        skills: d.skills,
      };
    }

    let jobData;
    if (jobSnap.exists) {
      const d = JobEntity.fromFirestore(jobSnap);
      jobData = {
        id: jobSnap.id,
        name: d.name,
        status: d.status,
        departmentId: d.departmentId,
        headcountTarget: d.headcountTarget,
        applyEnd: d.applyEnd,
      };
    }
    //loại bỏ cvId, jobId
    const { cvId, jobId, ...appData } = app;
    return {
      ...appData,
      cv: cvData,
      job: jobData,
    };
  }

  private validateStatusTransition(
    current: ApplicationStatus,
    next: ApplicationStatus,
  ): void {
    // Bản đồ quy định các bước nhảy hợp lệ
    // Key: Trạng thái hiện tại -> Value: Các trạng thái ĐƯỢC PHÉP chuyển tới
    const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> =
      {
        [ApplicationStatus.APPLIED]: [
          ApplicationStatus.SCREENING,
          ApplicationStatus.REJECTED,
        ],
        [ApplicationStatus.SCREENING]: [
          ApplicationStatus.INTERVIEW,
          ApplicationStatus.REJECTED,
        ],
        [ApplicationStatus.INTERVIEW]: [
          ApplicationStatus.OFFERED,
          ApplicationStatus.REJECTED,
        ],
        [ApplicationStatus.OFFERED]: [
          ApplicationStatus.HIRED,
          ApplicationStatus.REJECTED,
        ],

        // HIRED và REJECTED là trạng thái cuối (Terminal States), không thể chuyển đi đâu nữa
        [ApplicationStatus.HIRED]: [],
        [ApplicationStatus.REJECTED]: [],
      };

    const allowedNextSteps = ALLOWED_TRANSITIONS[current];

    // Check logic
    if (!allowedNextSteps || !allowedNextSteps.includes(next)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${current} sang ${next}. Quy trình hợp lệ: ${current} -> [${allowedNextSteps.join(', ')}]`,
      );
    }
  }
}
