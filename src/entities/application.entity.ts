import { DocumentSnapshot } from 'firebase-admin/firestore';

export const APPLICATION_COLLECTION_NAME = 'applications';

export enum ApplicationStatus {
    APPLIED = 'APPLIED',         // Ứng tuyển
    SCREENING = 'SCREENING',     // Sàng lọc
    INTERVIEW = 'INTERVIEW',     // Phỏng vấn
    OFFERED = 'OFFERED',         // Đề nghị
    HIRED = 'HIRED',             // Được nhận
    REJECTED = 'REJECTED',       // Từ chối (Rớt)
}

export class ApplicationEntity {
    id?: string;
    cvId: string;
    jobId: string;
    status: ApplicationStatus; // ApplicationStatus

    interviewScheduled?: Date;
    feedback?: string;         // Đánh giá/Nhận xét
    rating?: number;
    rejectionReason?: string;  // Lý do từ chối

    appliedAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<ApplicationEntity>) {
        Object.assign(this, partial);

        // Helper convert Date
        const toDate = (val: any) => (val && typeof val.toDate === 'function' ? val.toDate() : val);

        this.interviewScheduled = toDate(this.interviewScheduled);
        this.appliedAt = toDate(this.appliedAt) || new Date();
        this.updatedAt = toDate(this.updatedAt) || new Date();

        // Default value
        this.status = this.status || ApplicationStatus.APPLIED;
    }

    static fromFirestore(doc: DocumentSnapshot): ApplicationEntity{
        return new ApplicationEntity({
            id: doc.id,
            ...doc.data(),
        });
    }

    toFirestore() {
        return {
            cvId: this.cvId,
            jobId: this.jobId,
            status: this.status,
            interviewScheduled: this.interviewScheduled || null,
            feedback: this.feedback || null,
            rating: this.rating || null,
            rejectionReason: this.rejectionReason || null,
            appliedAt: this.appliedAt,
            updatedAt: this.updatedAt,
        };
    }
}