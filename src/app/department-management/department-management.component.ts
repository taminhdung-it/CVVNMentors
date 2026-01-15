import { Component, OnInit } from '@angular/core';

export interface Department {
  id?: number;
  name: string;
  managerName?: string;
  positionCount?: number;
  description?: string;
  status: 'Đang hoạt động' | 'Đóng';
  createdBy: string;
  createdDate: string;
}

@Component({
  selector: 'app-department-management',
  templateUrl: './department-management.component.html',
  styleUrls: ['./department-management.component.css']
})
export class DepartmentManagementComponent implements OnInit {
  departments: Department[] = [];
  searchTerm: string = '';
  nameFilter: string = '';
  statusFilter: string = '';
  
  showAddModal: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  editingDeptId: number | null = null;
  
  newDepartment: Department = {
    name: '',
    managerName: '',
    positionCount: 0,
    description: '',
    status: 'Đang hoạt động',
    createdBy: 'Đào Quốc Sơn Hà',
    createdDate: ''
  };

  constructor() {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.departments = [
      {
        id: 1,
        name: 'Phòng Công Nghệ Thông Tin',
        managerName: 'Nguyễn Văn A',
        positionCount: 5,
        description: 'Quản lý hệ thống công nghệ thông tin và phát triển phần mềm',
        status: 'Đang hoạt động',
        createdBy: 'Đào Quốc Sơn Hà',
        createdDate: '07-01-2026'
      },
      {
        id: 2,
        name: 'Phòng Nhân Sự',
        managerName: 'Trần Thị B',
        positionCount: 3,
        description: 'Quản lý tuyển dụng, đào tạo và phát triển nhân sự',
        status: 'Đang hoạt động',
        createdBy: 'Đào Quốc Sơn Hà',
        createdDate: '07-01-2026'
      },
      {
        id: 3,
        name: 'Phòng Kinh Doanh',
        managerName: 'Lê Văn C',
        positionCount: 8,
        description: 'Phát triển thị trường và chăm sóc khách hàng',
        status: 'Đang hoạt động',
        createdBy: 'Đào Quốc Sơn Hà',
        createdDate: '05-01-2026'
      },
      {
        id: 4,
        name: 'Phòng Kế Toán',
        managerName: 'Phạm Thị D',
        positionCount: 2,
        description: 'Quản lý tài chính và kế toán công ty',
        status: 'Đóng',
        createdBy: 'Đào Quốc Sơn Hà',
        createdDate: '05-01-2026'
      },
      {
        id: 5,
        name: 'Phòng Marketing',
        managerName: 'Hoàng Văn E',
        positionCount: 4,
        description: 'Xây dựng thương hiệu và chiến lược marketing',
        status: 'Đang hoạt động',
        createdBy: 'Đào Quốc Sơn Hà',
        createdDate: '07-01-2026'
      }
    ];
  }

  get filteredDepartments(): Department[] {
    return this.departments.filter(dept => {
      const matchSearch = dept.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                         (dept.managerName && dept.managerName.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
                         (dept.description && dept.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      const matchName = !this.nameFilter || dept.name === this.nameFilter;
      const matchStatus = !this.statusFilter || dept.status === this.statusFilter;
      
      return matchSearch && matchName && matchStatus;
    });
  }

  handleClearFilters(): void {
    this.searchTerm = '';
    this.nameFilter = '';
    this.statusFilter = '';
  }

  handleOpenAddModal(): void {
    this.modalMode = 'add';
    this.editingDeptId = null;
    this.newDepartment = {
      name: '',
      managerName: '',
      positionCount: 0,
      description: '',
      status: 'Đang hoạt động',
      createdBy: 'Đào Quốc Sơn Hà',
      createdDate: ''
    };
    this.showAddModal = true;
  }

  handleOpenEditModal(dept: Department): void {
    this.modalMode = 'edit';
    this.editingDeptId = dept.id!;
    this.newDepartment = { ...dept };
    this.showAddModal = true;
  }

  handleCloseModal(): void {
    this.showAddModal = false;
  }

  handleSaveDepartment(): void {
    if (!this.newDepartment.name.trim()) {
      alert('Vui lòng nhập tên phòng ban');
      return;
    }

    if (this.modalMode === 'add') {
      const newId = Math.max(...this.departments.map(d => d.id || 0), 0) + 1;
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      
      this.departments.push({
        ...this.newDepartment,
        id: newId,
        createdDate: formattedDate
      });
    } else if (this.editingDeptId !== null) {
      const index = this.departments.findIndex(d => d.id === this.editingDeptId);
      if (index !== -1) {
        this.departments[index] = { 
          ...this.newDepartment, 
          id: this.editingDeptId,
          createdDate: this.departments[index].createdDate,
          createdBy: this.departments[index].createdBy
        };
      }
    }

    this.showAddModal = false;
  }

  handleToggleStatus(deptId: number): void {
    this.departments = this.departments.map(dept =>
      dept.id === deptId
        ? { ...dept, status: dept.status === 'Đang hoạt động' ? 'Đóng' : 'Đang hoạt động' }
        : dept
    );
  }

  handleDeleteDepartment(id: number): void {
    if (confirm('⚠️ Bạn có chắc chắn muốn xóa phòng ban này?')) {
      this.departments = this.departments.filter(d => d.id !== id);
      alert('✅ Xóa phòng ban thành công!');
    }
  }
}