export interface ApiTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

export type DepartmentStatus = 'ACTIVE' | 'INACTIVE';

export interface Department {
  id: string;
  name: string;
  description?: string;
  status: DepartmentStatus;
  createdBy: string;
  createdAt: ApiTimestamp;
  updatedAt?: ApiTimestamp;
}

export interface DepartmentResponse {
  data: Department[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
