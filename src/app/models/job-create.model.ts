export interface CreateJobPayload {
  departmentId: string;
  name: string;
  description: string;
  skills: string[];
  headcountTarget: number;
  applyStart: string; // YYYY-MM-DD
  applyEnd: string; // YYYY-MM-DD
}

export interface JobView {
  id: string;
  jobApiId?: string;
  title: string;
  department: string;
  status: 'Mở' | 'Đóng' | 'Khóa';
  description: string;
  recruitmentCount?: number;
  hiredCount?: number;
  createdDate: string;
  requirements?: string;
  showMenu?: boolean;
}
