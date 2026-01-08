import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import {
  APPLICATION_COLLECTION_NAME,
  ApplicationEntity,
  ApplicationStatus,
} from '../../entities/application.entity';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UpdateApplicationDetailsDto } from './dto/update-application.dto';
import { FilterApplicationDto } from './dto/filter-application.dto';

@Injectable()
export class ApplicationService {
  constructor(private readonly firebaseService: FirebaseService) {}


  async updateStatus(id: string, dto: UpdateApplicationStatusDto) {
    const docRef = this.firebaseService.firestore.collection(APPLICATION_COLLECTION_NAME).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng tuyển');
    }

    const currentApp = ApplicationEntity.fromFirestore(doc);
    const oldStatus = currentApp.status as ApplicationStatus;
    const newStatus = dto.status;

    // Trạng thái mới và cũ trùng nhau
    if (oldStatus === newStatus) {
      throw new BadRequestException(`Hồ sơ đã ở trạng thái ${newStatus} rồi, không cần cập nhật.`);
    }

    // Kiểm tra luồng đi
    this.validateStatusTransition(oldStatus, newStatus);

    // Nếu REJECTED thì bắt buộc có lý do
    if (newStatus === ApplicationStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException('Vui lòng nhập lý do từ chối khi cập nhật trạng thái REJECTED.');
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
    const docRef = this.firebaseService.firestore.collection(APPLICATION_COLLECTION_NAME).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng tuyển');
    }

    // Chỉ map các field có gửi lên
    const updates: any = { updatedAt: new Date() }; // Luôn cập nhật updatedAt

    if (dto.interviewScheduled) updates.interviewScheduled = new Date(dto.interviewScheduled);
    if (dto.feedback !== undefined) updates.feedback = dto.feedback;
    if (dto.rating !== undefined) updates.rating = dto.rating;
    if (dto.rejectionReason !== undefined) updates.rejectionReason = dto.rejectionReason;

    await docRef.update(updates);

    return { id, message: 'Cập nhật thông tin thành công' };
  }

  async findAllByJob(jobId: string, filter: FilterApplicationDto) {
    const { page = 1, limit = 10, status } = filter;
    const offset = (page - 1) * limit;

    //  theo JobId
    let query = this.firebaseService.firestore
      .collection(APPLICATION_COLLECTION_NAME)
      .where('jobId', '==', jobId);

    // lọc theo status
    if (status) {
      query = query.where('status', '==', status);
    }

    // 3. Đếm tổng số (cho phân trang)
    const countSnap = await query.count().get();
    const total = countSnap.data().count;

    // 4. Sắp xếp & Phân trang
    // Lưu ý: Cần tạo Composite Index trong Firestore cho (jobId ASC, appliedAt DESC)
    query = query.orderBy('appliedAt', 'desc').offset(offset).limit(limit);

    const snapshot = await query.get();
    const data = snapshot.docs.map((doc) => ApplicationEntity.fromFirestore(doc));

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
    const docRef = this.firebaseService.firestore.collection(APPLICATION_COLLECTION_NAME).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Không tìm thấy hồ sơ ứng tuyển');
    }

    // Convert sang Entity
    return ApplicationEntity.fromFirestore(doc);
  }

  private validateStatusTransition(current: ApplicationStatus, next: ApplicationStatus): void {
    // Bản đồ quy định các bước nhảy hợp lệ
    // Key: Trạng thái hiện tại -> Value: Các trạng thái ĐƯỢC PHÉP chuyển tới
    const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
      [ApplicationStatus.APPLIED]:   [ApplicationStatus.SCREENING, ApplicationStatus.REJECTED],
      [ApplicationStatus.SCREENING]: [ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED],
      [ApplicationStatus.INTERVIEW]: [ApplicationStatus.OFFERED, ApplicationStatus.REJECTED],
      [ApplicationStatus.OFFERED]:   [ApplicationStatus.HIRED, ApplicationStatus.REJECTED],

      // HIRED và REJECTED là trạng thái cuối (Terminal States), không thể chuyển đi đâu nữa
      [ApplicationStatus.HIRED]:     [],
      [ApplicationStatus.REJECTED]:  [],
    };

    const allowedNextSteps = ALLOWED_TRANSITIONS[current];

    // Check logic
    if (!allowedNextSteps || !allowedNextSteps.includes(next)) {
      throw new BadRequestException(
        `Không thể chuyển trạng thái từ ${current} sang ${next}. Quy trình hợp lệ: ${current} -> [${allowedNextSteps.join(', ')}]`
      );
    }
  }
}