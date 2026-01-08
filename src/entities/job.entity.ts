import { DocumentSnapshot } from 'firebase-admin/firestore';

export const JOB_COLLECTION_NAME="jobs" ;


export enum JobStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  LOCKED = 'LOCKED',
}

export class JobEntity {
  id?: string;
  departmentId: string;
  name: string;
  description: string;
  skills: string[];
  headcountTarget: number;
  headcountHired: number;
  status: string;
  applyStart: Date;
  applyEnd: Date;
  closedAt?: Date;
  closedReason?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  jdFileUrl?: string; // Link file JD
  publicId?: string; // ID của Cloudinary để xóa sau này

  constructor(partial: Partial<JobEntity>) {
    Object.assign(this, partial);

    // Xử lý convert Date/Timestamp
    const toDate = (val: any) => (val && typeof val.toDate === 'function' ? val.toDate() : val);

    this.applyStart = toDate(this.applyStart);
    this.applyEnd = toDate(this.applyEnd);
    this.closedAt = toDate(this.closedAt);
    this.createdAt = toDate(this.createdAt) || new Date();
    this.updatedAt = toDate(this.updatedAt) || new Date();

    this.status = this.status || JobStatus.OPEN;
    this.headcountHired = this.headcountHired || 0;
    this.skills = this.skills || [];
  }

  static fromFirestore(doc: DocumentSnapshot): JobEntity {
    const data = doc.data();
    return new JobEntity({
      id: doc.id,
      ...data,
    });
  }

  toFirestore() {
    return {
      departmentId: this.departmentId,
      name: this.name,
      description: this.description || '',
      skills: this.skills,
      headcountTarget: this.headcountTarget,
      headcountHired: this.headcountHired,
      status: this.status,
      applyStart: this.applyStart,
      applyEnd: this.applyEnd,
      closedAt: this.closedAt || null,
      closedReason: this.closedReason || null,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      jdFileUrl: this.jdFileUrl || null,
      publicId: this.publicId || null,
    };
  }
}