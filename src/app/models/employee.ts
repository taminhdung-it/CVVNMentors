// models/employee.ts
export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  departmentId: string;
  createdAt: string;
  avatar?: string;
}

// models/role.ts
export interface Role {
  id: string;
  name: string;
  employeeCount: number;
}

// models/filter.ts
export interface EmployeeFilter {
  searchText: string;
  workStatus: string;
  role: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// models/api-response.ts
export interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}