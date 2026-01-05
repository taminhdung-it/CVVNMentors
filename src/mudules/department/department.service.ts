import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import {
  DEPARTMENT_COLLECTION_NAME,
  DepartmentEntity,
  DepartmentStatus,
} from '../../entities/department.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { SearchDepartmentDto } from './dto/search-department.dto';
import { FirebaseService } from '../../firebase/firebase.service';
import { ChangeDepartmentStatusDto } from './dto/change-department-status.dto';
import { JOB_COLLECTION_NAME, JobStatus } from '../../entities/job.entity';
@Injectable()
export class DepartmentService {

  private readonly collection = DEPARTMENT_COLLECTION_NAME;

  constructor(private readonly firebaseService: FirebaseService) {}
  async create(dto: CreateDepartmentDto, userId: string) {

    const newDept = new DepartmentEntity({
      ...dto,
      createdBy: userId,
      status: DepartmentStatus.ACTIVE
    });

    const docRef = await this.firebaseService.firestore.collection(this.collection).add(newDept.toFirestore());
    return { id: docRef.id, ...newDept };
  }

  async findAll(pagination: PaginationDto) {
    const { page =1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    const query = this.firebaseService.firestore.collection(this.collection).orderBy('createdAt', 'desc');

    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    const snapshot = await query.offset(offset).limit(limit).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  //dùng tạm
  async search(filter: SearchDepartmentDto) {
    const { page = 1, limit = 10, keyword, status } = filter;
    const offset = (page - 1) * limit;

    let query: FirebaseFirestore.Query = this.firebaseService.firestore.collection(this.collection);

    if (status) {
      query = query.where('status', '==', status);
    }


    if (keyword) {
      query = query.where('name', '>=', keyword).where('name', '<=', keyword + '\uf8ff');
    }

    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    const snapshot = await query.orderBy('name').offset(offset).limit(limit).get(); // Order by name khi search
    const data = snapshot.docs.map(doc => DepartmentEntity.fromFirestore(doc.data(), doc.id));

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
  async findOne(id: string) {
    const doc = await this.firebaseService.firestore.collection(this.collection).doc(id).get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy phòng ban');
    return DepartmentEntity.fromFirestore(doc.data(), doc.id);
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const docRef = this.firebaseService.firestore.collection(this.collection).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) throw new NotFoundException('Không tìm thấy phòng ban');

    await docRef.update({
      ...dto,
      updatedAt: new Date(),
    });

    return { id, message: 'Cập nhật thông tin thành công' };
  }
  async changeStatus(id: string, dto: ChangeDepartmentStatusDto) {
    const { status } = dto;
    const docRef = this.firebaseService.firestore.collection(this.collection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Không tìm thấy phòng ban');
    }

    // Cần kiểm tra xem có Job nào đang Open không
    if (status === DepartmentStatus.INACTIVE) {
      // Query đếm số lượng Job đang mở thuộc phòng ban này
      const activeJobsSnapshot = await this.firebaseService.firestore
        .collection(JOB_COLLECTION_NAME)
        .where('departmentId', '==', id)
        .where('status', '==', JobStatus.OPEN)   // Chỉ check job đang mở
        .count()
        .get();

      const activeJobCount = activeJobsSnapshot.data().count;

      if (activeJobCount > 0) {
        throw new BadRequestException(
          `Không thể đóng phòng ban này vì còn ${activeJobCount} công việc đang tuyển dụng. Vui lòng đóng các job đang mở trước.`
        );
      }
    }

    // Nếu thỏa mãn điều kiện thì update
    await docRef.update({
      status: status,
      updatedAt: new Date(),
    });

    return {
      id,
      status,
      message: `Đã chuyển trạng thái phòng ban sang ${status} thành công`,
    };
  }
}
