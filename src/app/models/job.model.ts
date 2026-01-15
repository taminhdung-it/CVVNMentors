import { ApplicationStatus } from '../job-management/job-management.component';

export interface JobApi {
  id: string;
  departmentId: string;
  name: string;
  description: string;

  skills: string[] | string;

  headcountTarget: number;
  headcountHired: number;

  status: 'OPEN' | 'CLOSED' | 'LOCKED';

  applyStart: string;
  applyEnd: string;

  createdBy?: string;
  createdAt: string;
  updatedAt: string;

  closedAt?: string | null;
  closedReason?: string | null;

  jdFileUrl?: string | null;
  publicId?: string | null;

  // Firebase style (optional)
  closed_at?: {
    _seconds: number;
    _nanoseconds: number;
  };

  updated_at?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface ApplicationDetail {
  // ===== APPLICATION =====
  id: string;
  status: ApplicationStatus;

  interviewScheduled: string | null;
  feedback: string | null;
  rating: number | null;
  rejectionReason: string | null;

  appliedAt: string;
  updatedAt: string;

  // ===== JOB (lồng trong application) =====
  job: {
    id: string;
    name: string;
    status: 'OPEN' | 'CLOSED' | 'LOCKED';
    departmentId: string;
    departmentName?: string;
    headcountTarget: number;
    applyEnd: string;
  };
}
