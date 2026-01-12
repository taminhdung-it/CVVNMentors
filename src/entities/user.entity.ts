import { firestore } from 'firebase-admin';
import Timestamp = firestore.Timestamp;
import { DocumentSnapshot } from 'firebase-admin/firestore';

export const USER_COLLECTION_NAME = "users";


export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: Date;
  role: string;// vai trò của nhân viên(vd: kế toán,...)
  gender: string;
  status: string; // ACTIVE, INACTIVE
  departmentId: string;
  createdAt: Date;
  updatedAt: Date;


  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
    this.createdAt = this.createdAt || null;
    this.updatedAt =  this.updatedAt || null;
  }

  static fromFirestore(cvDoc:  DocumentSnapshot):User {
    const data = cvDoc.data();
    return new User({
      id: cvDoc.id,
      ...data,
    });
  }

  toFirestore() {
    return {
      name: this.name,
      email: this.email,
      phone: this.phone,
      status: this.status,
      address: this.address,
      departmentId: this.departmentId,
      dob: this.dob,
      gender: this.gender,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

}