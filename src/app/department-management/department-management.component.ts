import { Component } from '@angular/core';

interface Department {
  id: number;
  code: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  jobCount: number;
}

@Component({
  selector: 'app-department-management',
  templateUrl: './department-management.component.html',
  styleUrls: ['./department-management.component.css']
})
export class DepartmentManagementComponent {

  // ======================
  // DATA
  // ======================
  departments: Department[] = [
    {
      id: 1,
      code: 'IT',
      name: 'Công nghệ thông tin',
      description: 'Phát triển hệ thống',
      status: 'ACTIVE',
      jobCount: 5
    },
    {
      id: 2,
      code: 'HR',
      name: 'Nhân sự',
      description: 'Quản lý nhân sự',
      status: 'INACTIVE',
      jobCount: 2
    }
  ];

  // ======================
  // SEARCH + FILTER
  // ======================
  keyword = '';
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';

  get filteredDepartments(): Department[] {
    return this.departments.filter(d => {
      const matchKeyword =
        d.code.toLowerCase().includes(this.keyword.toLowerCase()) ||
        d.name.toLowerCase().includes(this.keyword.toLowerCase());

      const matchStatus =
        this.statusFilter === 'ALL' || d.status === this.statusFilter;

      return matchKeyword && matchStatus;
    });
  }

  // ======================
  // MODAL
  // ======================
  showModal = false;
  isEdit = false;

  form: Department = {
    id: 0,
    code: '',
    name: '',
    description: '',
    status: 'ACTIVE',
    jobCount: 0
  };

  openAdd() {
    this.isEdit = false;
    this.form = {
      id: 0,
      code: '',
      name: '',
      description: '',
      status: 'ACTIVE',
      jobCount: 0
    };
    this.showModal = true;
  }

  openEdit(d: Department) {
    this.isEdit = true;
    this.form = { ...d };
    this.showModal = true;
  }

  save() {
    if (this.isEdit) {
      const index = this.departments.findIndex(d => d.id === this.form.id);
      if (index !== -1) {
        this.departments[index] = { ...this.form };
      }
    } else {
      this.form.id = Date.now();
      this.departments.push({ ...this.form });
    }
    this.close();
  }

  close() {
    this.showModal = false;
  }

  delete(id: number) {
    this.departments = this.departments.filter(d => d.id !== id);
  }
}
