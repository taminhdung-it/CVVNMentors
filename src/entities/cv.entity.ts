import { DocumentSnapshot } from 'firebase-admin/firestore';

export const CV_COLLECTION_NAME = "cv";
export enum CvStatus {
  NEW = 'NEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

export class Experience {
  title: string| null;
  dates: string| null;
  location: string| null;
  organization: string| null;
}

export class CvEntity {
  id?: string;
  createdBy: string;
  cvType: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  level: string;
  status: CvStatus;
  cvFileUrl: string;
  publicId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  skills: string[];
  education: string[];
  experienceYears: number;
  experience: Experience[];
  constructor(partial: Partial<CvEntity>) {
    Object.assign(this, partial);
    // Set default logic
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = new Date();
    this.skills = this.skills || [];
    this.education = this.education || [];
    this.status = this.status || CvStatus.NEW;

    this.cvType = this.cvType || 'Unclassified';
    this.position = this.position || 'Unknown';
    this.level = this.level || 'Unknown';
    this.cvFileUrl = this.cvFileUrl || '';
    this.publicId = this.publicId || null;
    this.experience = this.experience || [];
  }

  toFirestore() {
    return {
      createdBy: this.createdBy,
      cvType: this.cvType,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      position: this.position,
      level: this.level,
      status: this.status,
      cvFileUrl: this.cvFileUrl,
      publicId: this.publicId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      skills: this.skills,
      education: this.education,
      experienceYears: this.experienceYears || 0,

      experience: this.experience.map(exp => ({
        title: exp.title ?? null,
        dates: exp.dates ?? null,
        location: exp.location ?? null,
        organization: exp.organization ?? null
      })),
    };
  }

  static fromFirestore(cvDoc:  DocumentSnapshot):CvEntity {
    const data = cvDoc.data();
    return new CvEntity({
      id: cvDoc.id,
      ...data,
    });
  }
}