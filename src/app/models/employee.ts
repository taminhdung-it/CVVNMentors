// models/employee.ts
export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
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