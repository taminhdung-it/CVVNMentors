import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {CreateJobDto} from './dto/create-job.dto';
import {JOB_COLLECTION_NAME, JobEntity, JobStatus,} from '../../entities/job.entity';
import {DEPARTMENT_COLLECTION_NAME} from '../../entities/department.entity';
import {PaginationDto} from '../../common/dto/pagination.dto';
import {SearchJobDto} from './dto/search-job.dto';
import {CloseJobDto} from './dto/close-job.dto';
import {FirebaseService} from '../../firebase/firebase.service';
import { UpdateJobDto } from './dto/update-job.dto';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class JobService {
  private readonly jobCollection = JOB_COLLECTION_NAME;
  private readonly deptCollection = DEPARTMENT_COLLECTION_NAME;
  private readonly logger = new Logger(JobService.name);

  private readonly cloudinaryFolderName = "Job";

  constructor(private readonly firebaseService: FirebaseService, private readonly cloudinaryService: CloudinaryService,) {}

  async create(dto: CreateJobDto, userId: string, file?: Express.Multer.File) {
    // 1. Validate phòng ban
    const deptDoc = await this.firebaseService.firestore.collection(this.deptCollection).doc(dto.departmentId).get();
    if (!deptDoc.exists) {
      throw new NotFoundException('Không tìm thấy phòng ban');
    }

    // 2. Validate ngày tháng
    if (new Date(dto.applyStart) >= new Date(dto.applyEnd)) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc.');
    }

    // 3. Xử lý Upload file (Soft Failure Logic)
    let jdFileUrl;
    let publicId;
    let uploadWarning;

    if (file) {
      try {
        // Upload vào folder 'job_jds'
        const uploadResult = await this.cloudinaryService.uploadFile(file, this.cloudinaryFolderName);
        jdFileUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
      } catch (error) {
        this.logger.error(`Upload JD thất bại: ${error.message}`);
        // Không throw lỗi chặn, chỉ ghi nhận cảnh báo để trả về FE
        uploadWarning = 'Tạo Job thành công nhưng upload file JD thất bại. Vui lòng cập nhật lại file sau.';
      }
    }

    // 4. Tạo Entity
    const newJob = new JobEntity({
      departmentId: dto.departmentId,
      name: dto.name,
      description: dto.description,
      skills: dto.skills || [],
      headcountTarget: dto.headcountTarget,
      applyStart: new Date(dto.applyStart),
      applyEnd: new Date(dto.applyEnd),
      createdBy: userId,
      status: JobStatus.OPEN,
      jdFileUrl: jdFileUrl,       // Lưu URL (hoặc null nếu lỗi/không có file)
      publicId: publicId, // Lưu PublicID (hoặc null)
    });

    // 5. Lưu xuống DB
    const docRef = await this.firebaseService.firestore.collection(this.jobCollection).add(newJob.toFirestore());

    return {
      id: docRef.id,
      ...newJob,
      warning: uploadWarning // Trả về cảnh báo nếu có
    };
  }
  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10} = pagination;
    const offset = (page - 1) * limit;

    const query = this.firebaseService.firestore.collection(this.jobCollection).orderBy('createdAt', 'desc');

    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    const snapshot = await query.offset(offset).limit(limit).get();
    const data = snapshot.docs.map(doc => JobEntity.fromFirestore(doc));
    console.log(data);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // dùng tạm
  async search(filter: SearchJobDto) {
    const {
      page = 1, limit = 10,
      keyword, departmentId, status, createdBy,
      createdFrom, createdTo, deadlineFrom, deadlineTo
    } = filter;

    const offset = (page - 1) * limit;

    let query: FirebaseFirestore.Query = this.firebaseService.firestore.collection(this.jobCollection);

    // 1. Filter chính xác (Equality)
    if (departmentId) query = query.where('departmentId', '==', departmentId);
    if (status) query = query.where('status', '==', status);
    if (createdBy) query = query.where('createdBy', '==', createdBy);

    // 2. Filter theo khoảng thời gian (Range)
    // Lưu ý: Firestore yêu cầu tạo Composite Index nếu filter range trên nhiều trường khác nhau
    if (createdFrom) query = query.where('createdAt', '>=', new Date(createdFrom));
    if (createdTo) query = query.where('createdAt', '<=', new Date(createdTo));

    if (deadlineFrom) query = query.where('applyEnd', '>=', new Date(deadlineFrom));
    if (deadlineTo) query = query.where('applyEnd', '<=', new Date(deadlineTo));

    // 3. Filter Keyword (Prefix search cho Tên Job)
    if (keyword) {
      // Lưu ý: Nếu kết hợp Range Filter ở trên với keyword, Firestore có thể báo lỗi cần Index
      query = query.where('name', '>=', keyword).where('name', '<=', keyword + '\uf8ff');
    }

    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    // Order by created_at mặc định nếu không search keyword (vì search keyword buộc phải order by name)
    if (!keyword) {
      query = query.orderBy('createdAt', 'desc');
    } else {
      query = query.orderBy('name');
    }

    const snapshot = await query.offset(offset).limit(limit).get();
    const data = snapshot.docs.map(doc => JobEntity.fromFirestore(doc));

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const doc = await this.firebaseService.firestore.collection(this.jobCollection).doc(id).get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy job');
    return JobEntity.fromFirestore(doc);
  }

  async update(id: string, dto: UpdateJobDto, file?: Express.Multer.File) {
    const docRef = this.firebaseService.firestore.collection(this.jobCollection).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy job');

    const jobData = JobEntity.fromFirestore(doc);

    if (jobData.status === JobStatus.CLOSED) {
      throw new BadRequestException('Không thể cập nhật thông tin cho Job đã đóng');
    }

    const updates: any = { ...dto, updatedAt: new Date() };
    if (dto.applyEnd) updates.applyEnd = new Date(dto.applyEnd);

    // Xử lý File Upload (Nếu có file mới gửi lên)
    let uploadWarning: any = null;

    if (file) {
      try {
        // 1. Upload file mới trước
        const uploadResult = await this.cloudinaryService.uploadFile(file, this.cloudinaryFolderName);

        // 2. Nếu upload thành công, cập nhật URL và ID vào biến updates
        updates.jdUrl = uploadResult.secure_url;
        updates.publicId = uploadResult.public_id;

        // 3. Xóa file cũ (nếu tồn tại)
        if (jobData.publicId) {
          try {
            await this.cloudinaryService.deleteFile(jobData.publicId);
          } catch (deleteErr) {
            this.logger.warn(`Xóa file JD cũ thất bại: ${deleteErr.message} - Ignored`);
            // Không throw lỗi ở đây để đảm bảo luồng update tiếp tục
          }
        }

      } catch (error) {
        this.logger.error(`Cập nhật file JD thất bại: ${error.message}`);
        // Soft Failure: Báo lỗi nhưng vẫn tiếp tục update các trường text khác
        uploadWarning = 'Cập nhật thông tin thành công nhưng upload file JD mới thất bại. File cũ (nếu có) vẫn được giữ nguyên.';
      }
    }

    await docRef.update(updates);

    return {
      id,
      message: 'Cập nhật Job thành công',
      warning: uploadWarning // Trả về cảnh báo FE hiển thị
    };
  }

  async closeJob(id: string, dto: CloseJobDto) {
    const docRef = this.firebaseService.firestore.collection(this.jobCollection).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy job');
      const job = JobEntity.fromFirestore(doc);

      // Logic: Nếu đang Open rồi thì thôi
      if (job.status === JobStatus.CLOSED) {
          throw new BadRequestException('Job này đang đóng(CLOSED)');
      }
    await docRef.update({
      status: JobStatus.CLOSED,
      closed_at: new Date(),
      closed_reason: dto.reason,
      updated_at: new Date()
    });
    return { id, status: JobStatus.CLOSED };
  }

  async openJob(id: string) {
    const docRef = this.firebaseService.firestore.collection(this.jobCollection).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy job');

    const job = JobEntity.fromFirestore(doc);

    // Logic: Nếu đang Open rồi thì thôi
    if (job.status === JobStatus.OPEN) {
      throw new BadRequestException('Job này đang ở trạng thái Mở');
    }

    // Nếu Job đã Closed -> Mở lại sẽ xóa closedAt/closedReason
    await docRef.update({
      status: JobStatus.OPEN,
      closedAt: null,
      closedReason: null,
      updatedAt: new Date()
    });

    return { id, status: JobStatus.OPEN, message: 'Đã mở lại Job thành công' };
  }
  async lockJob(id: string) {
    const docRef = this.firebaseService.firestore.collection(this.jobCollection).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy job');

    const job = JobEntity.fromFirestore(doc);

      if (job.status === JobStatus.LOCKED) {
          throw new BadRequestException('Job đã khóa');
      }
    if (job.status === JobStatus.CLOSED) {
      throw new BadRequestException('Không thể khóa Job đã đóng (Closed)');
    }

    await docRef.update({
      status: JobStatus.LOCKED,
      updatedAt: new Date()
    });

    return { id, status: JobStatus.LOCKED, message: 'Đã khóa Job tạm thời' };
  }
}
