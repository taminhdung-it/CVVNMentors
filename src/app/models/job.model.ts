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
  createdAt: string;
  updatedAt: string;
  jdFileUrl?: string | null;
  publicId?: string | null;
}
