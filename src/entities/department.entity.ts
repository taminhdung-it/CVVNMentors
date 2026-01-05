import { firestore } from 'firebase-admin';
import Timestamp = firestore.Timestamp;

export const DEPARTMENT_COLLECTION_NAME = "department";


export enum DepartmentStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export class DepartmentEntity {
  id?: string;
    name: string;
    status: string; // ACTIVE, INACTIVE
    description: string;
    createdBy: string; // User ID
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<DepartmentEntity>) {
        Object.assign(this, partial);
        this.status = this.status || DepartmentStatus.ACTIVE;
        this.createdAt = this.createdAt || new Date();
        this.updatedAt = new Date();
    }

  static fromFirestore(data: any, id?: string): DepartmentEntity|null {
    if (!data) return null;

    // Helper xử lý Date từ Firestore Timestamp
    const toDate = (ts: any) => (ts instanceof Timestamp ? ts.toDate() : new Date(ts));

    return new DepartmentEntity({
      id: id,
      name: data.name,
      status: data.status,
      description: data.description,
      createdBy: data.createdBy,
      createdAt: toDate(data.createdAt) ,
      updatedAt: toDate(data.createdAt),
    });
  }

    toFirestore() {
        return {
            name: this.name,
            status: this.status,
            description: this.description || '',
            createdBy: this.createdBy,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }

}