import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Filter } from 'firebase-admin/firestore';
import { FirebaseService } from '../../firebase/firebase.service';
import { User, USER_COLLECTION_NAME, UserStatus } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {ChangeUserStatusDto} from "./dto/change-user-status.dto";
import {DEPARTMENT_COLLECTION_NAME} from "../../entities/department.entity";

@Injectable()
export class UserService {
    private readonly collectionName = USER_COLLECTION_NAME;
    private readonly logger = new Logger(UserService.name);

    constructor(private readonly firebaseService: FirebaseService) {}


    async create(dto: CreateUserDto) {
        const deptDoc = await this.firebaseService.firestore.collection(DEPARTMENT_COLLECTION_NAME).doc(dto.departmentId).get();
        if (!deptDoc.exists) throw new NotFoundException('Không tìm thấy phòng ban');
        const checkExist = await this.firebaseService.firestore
            .collection(this.collectionName)
            .where(Filter.or(
                Filter.where('email', '==', dto.email),
                Filter.where('phone', '==', dto.phone)
            ))
            .get();

        if (!checkExist.empty) {
            throw new BadRequestException('Email hoặc Số điện thoại đã tồn tại trong hệ thống.');
        }


        // Mật khẩu mặc định: User@123
        const defaultPassword = 'User@123';
        let userRecord: admin.auth.UserRecord;

        try {
            userRecord = await admin.auth().createUser({
                email: dto.email,
                password: defaultPassword,
                displayName: dto.name,
            });
        } catch (error) {
            throw new BadRequestException(`Lỗi tạo tài khoản Auth: ${error.message}`);
        }

        const newUser = new User({
            ...dto,
            address: dto.address,
            id: userRecord.uid,
            dob: new Date(dto.dob),
            status: UserStatus.ACTIVE,
        });

        await this.firebaseService.firestore
            .collection(this.collectionName)
            .doc(userRecord.uid)
            .set(newUser.toFirestore());

        return {
            id: userRecord.uid,
            message: 'Tạo nhân viên thành công',
            defaultPassword
        };
    }

    async findAll(pagination: PaginationDto) {
        const { page = 1, limit = 10 } = pagination;
        const offset = (page - 1) * limit;

        const query = this.firebaseService.firestore
            .collection(this.collectionName)
            .orderBy('createdAt', 'desc');

        const countSnap = await query.count().get();
        const total = countSnap.data().count;

        const snapshot = await query.offset(offset).limit(limit).get();
        const data = snapshot.docs.map(doc => User.fromFirestore(doc));

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }


    async findOne(id: string) {
        const doc = await this.firebaseService.firestore
            .collection(this.collectionName)
            .doc(id)
            .get();

        if (!doc.exists) throw new NotFoundException('Không tìm thấy nhân viên');
        return User.fromFirestore(doc);
    }

  async update(id: string, dto: UpdateUserDto) {
    const docRef = this.firebaseService.firestore.collection(this.collectionName).doc(id);
    const doc = await docRef.get();

      const deptDoc = await this.firebaseService.firestore.collection(DEPARTMENT_COLLECTION_NAME).doc(dto.departmentId).get();
      if (!deptDoc.exists) throw new NotFoundException('Không tìm thấy phòng ban');
    if (!doc.exists) throw new NotFoundException('Không tìm thấy nhân viên');


    if (dto.email || dto.phone) {
      const filters: any[] = [];

      // Chỉ thêm điều kiện nếu DTO có gửi lên
      if (dto.email) filters.push(Filter.where('email', '==', dto.email));
      if (dto.phone) filters.push(Filter.where('phone', '==', dto.phone));

      if (filters.length > 0) {
        // Tìm tất cả user có email HOẶC phone trùng với dữ liệu gửi lên
        const duplicateSnapshot = await this.firebaseService.firestore
          .collection(this.collectionName)
          .where(Filter.or(...filters))
          .get();

        duplicateSnapshot.forEach((resultDoc) => {
          // QUAN TRỌNG: Nếu tìm thấy doc trùng, nhưng ID của doc đó
          // TRÙNG với ID đang update -> Đây là chính user đó -> Hợp lệ, Bỏ qua.
          if (resultDoc.id !== id) {
            const data = resultDoc.data();

            // Kiểm tra kỹ xem trùng cái gì để báo lỗi chính xác
            if (dto.email && data.email === dto.email) {
              throw new BadRequestException(`Email '${dto.email}' đã được sử dụng bởi nhân viên khác.`);
            }
            if (dto.phone && data.phone === dto.phone) {
              throw new BadRequestException(`Số điện thoại '${dto.phone}' đã được sử dụng bởi nhân viên khác.`);
            }
          }
        });
      }
    }


    const updates: any = { ...dto, updatedAt: new Date() };

    // Ngày sinh dạng string -> convert sang Date
    if (dto.dob) {
      updates.dob = new Date(dto.dob);
    }

    // Cập nhật Firestore trước
    await docRef.update(updates);


    if (dto.email) {
      try {
        await admin.auth().updateUser(id, {
          email: dto.email
        });
      } catch (e) {
        this.logger.warn(`Không thể đồng bộ email sang Auth: ${e.message}`);
        // Tùy nghiệp vụ: Có thể throw lỗi để bắt user sửa lại hoặc chỉ log warning
      }
    }

    return { id, message: 'Cập nhật thành công' };
  }


    async search(filter: FilterUserDto) {
        const {
            page = 1, limit = 10,
            keyword, email, phone, // Search fields
            status, departmentId, role // Filter fields
        } = filter;

        const offset = (page - 1) * limit;
        let query: FirebaseFirestore.Query = this.firebaseService.firestore.collection(this.collectionName);

        // 1. Áp dụng Filters (Chính xác)
        if (status) query = query.where('status', '==', status);
        if (departmentId) query = query.where('departmentId', '==', departmentId);
        if (role) query = query.where('role', '==', role);
        if (email) query = query.where('email', '==', email);
        if (phone) query = query.where('phone', '==', phone);

        // 2. Áp dụng Search Keyword (Tìm theo tên - Prefix Search)
        if (keyword) {
            query = query
                .where('name', '>=', keyword)
                .where('name', '<=', keyword + '\uf8ff');
        }

        // 3. Đếm tổng
        const countSnap = await query.count().get();
        const total = countSnap.data().count;

        // 4. Sort & Paginate
        // Lưu ý: Nếu có search range (keyword), bắt buộc phải orderBy('name') trước
        if (keyword) {
            query = query.orderBy('name');
        } else {
            query = query.orderBy('createdAt', 'desc');
        }

        const snapshot = await query.offset(offset).limit(limit).get();
        const data = snapshot.docs.map(doc => User.fromFirestore(doc));

        return {
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    async updateStatus(id: string, dto: ChangeUserStatusDto) {
        const docRef = this.firebaseService.firestore.collection(this.collectionName).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new NotFoundException('Không tìm thấy nhân viên');
        }

        const userData = User.fromFirestore(doc);

        // Không cập nhật trùng trạng thái cũ
        if (userData.status === dto.status) {
            throw new BadRequestException(`Tài khoản đang ở trạng thái ${dto.status}, không cần cập nhật.`);
        }

        // Cập nhật trạng thái bên Firebase Authentication (Chặn đăng nhập)
        // Nếu status là INACTIVE -> disabled = true
        // Nếu status là ACTIVE -> disabled = false
        const isDisabled = dto.status === UserStatus.INACTIVE;

        try {
            await admin.auth().updateUser(id, {
                disabled: isDisabled
            });
        } catch (error) {
            // Có thể log lỗi nhưng không nên chặn luồng nếu user Auth không tìm thấy (trường hợp data không đồng bộ)
            console.warn(`Lỗi cập nhật Auth user ${id}:`, error.message);
        }

        // 3. Cập nhật trạng thái trong Firestore
        await docRef.update({
            status: dto.status,
            updatedAt: new Date(),
        });

        return {
            id,
            previousStatus: userData.status,
            currentStatus: dto.status,
            message: `Đã chuyển trạng thái tài khoản sang ${dto.status}`
        };
    }
}