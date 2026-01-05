import {BadRequestException, Injectable, NotFoundException,} from '@nestjs/common';
import {CreateJobDto} from './dto/create-job.dto';
import {UpdateJobDto} from './dto/update-job.dto';
import {JOB_COLLECTION_NAME, JobEntity, JobStatus,} from '../../entities/job.entity';
import {DEPARTMENT_COLLECTION_NAME} from '../../entities/department.entity';
import {PaginationDto} from '../../common/dto/pagination.dto';
import {SearchJobDto} from './dto/search-job.dto';
import {CloseJobDto} from './dto/close-job.dto';
import {FirebaseService} from '../../firebase/firebase.service';

@Injectable()
export class JobService {
  private readonly jobCollection = JOB_COLLECTION_NAME;
  private readonly deptCollection = DEPARTMENT_COLLECTION_NAME;
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(dto: CreateJobDto, userId: string) {
    const deptDoc = await this.firebaseService.firestore.collection(this.deptCollection).doc(dto.departmentId).get();
    if (!deptDoc.exists) {
      throw new NotFoundException('Không tìm thấy phòng ban');
    }
    // Validate: Ngày start < End
    if (new Date(dto.applyStart) >= new Date(dto.applyEnd)) {
      throw new BadRequestException('Ngày bắt đầu phải trước ngày kết thúc.');
    }

    const newJob = new JobEntity({
      departmentId: dto.departmentId,
      name: dto.name,
      description: dto.description,
      skills: dto.skills || [],
      headcountTarget: dto.headcountTarget,
      applyStart: new Date(dto.applyStart),
      applyEnd: new Date(dto.applyEnd),
      createdBy: userId,
      status: JobStatus.OPEN
    });

    const docRef = await this.firebaseService.firestore.collection(this.jobCollection).add(newJob.toFirestore());
    return { id: docRef.id, ...newJob };
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

  async update(id: string, dto: UpdateJobDto) {
    const docRef = this.firebaseService.firestore.collection(this.jobCollection).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy job');

    const jobData = JobEntity.fromFirestore(doc);

    if (jobData.status === JobStatus.CLOSED) {
      throw new BadRequestException('Không thể cập nhật thông tin cho Job đã đóng');
    }

    const updates: any = { ...dto, updatedAt: new Date() };
    if(dto.applyEnd) updates.applyEnd = new Date(dto.applyEnd);

    await docRef.update(updates);
    return { id, message: 'Cập nhật Job thành công' };
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
