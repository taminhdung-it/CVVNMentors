import { Component, OnInit } from '@angular/core';
import {
  Department,
  DepartmentStatus,
  ApiTimestamp,
} from '../models/department.model';
import { DepartmentService } from '../auth/auth/department.service';

@Component({
  selector: 'app-department-management',
  templateUrl: './department-management.component.html',
  styleUrls: ['./department-management.component.css'],
})
export class DepartmentManagementComponent implements OnInit {
  // ===== MODAL CHI TIẾT =====
  showDetailModal: boolean = false;
  selectedDepartment: Department | null = null;
  loadingDetail: boolean = false;
  isEditMode: boolean = false;
  openActionId: string | null = null;

  departments: Department[] = [];

  editForm = {
    name: '',
    description: '',
  };

  // filter
  searchTerm = '';
  statusFilter: DepartmentStatus | '' = '';

  // pagination
  page = 1;
  limit = 10;
  totalPages = 1;

  loading = false;

  constructor(private departmentService: DepartmentService) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;

    this.departmentService.getDepartments(this.page, this.limit).subscribe({
      next: (res) => {
        this.departments = res.data;
        this.totalPages = res.meta.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert('Không thể tải danh sách phòng ban');
        this.loading = false;
      },
    });
  }

  get departmentNames(): string[] {
    return Array.from(new Set(this.departments.map((d) => d.name)));
  }

  /** Filter client-side (API không hỗ trợ filter) */
  /** Filter client-side */
  get filteredDepartments(): Department[] {
    return this.departments.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (d.description || '')
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchStatus = !this.statusFilter || d.status === this.statusFilter;

      const matchName = !this.nameFilter || d.name === this.nameFilter;

      return matchSearch && matchStatus && matchName;
    });
  }

  /** Convert timestamp → dd-MM-yyyy */
  formatDate(ts?: ApiTimestamp | string): string {
    if (!ts) return '—';

    // ✅ API detail trả string ISO
    if (typeof ts === 'string') {
      const d = new Date(ts);
      return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN');
    }

    // ✅ API list trả Firestore Timestamp
    if ('_seconds' in ts) {
      return new Date(ts._seconds * 1000).toLocaleDateString('vi-VN');
    }

    return '—';
  }

  /** Status label tiếng Việt */
  getStatusLabel(status: DepartmentStatus): string {
    return status === 'ACTIVE' ? 'Hoạt động' : 'Đóng';
  }

  get pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(p: number): void {
    if (p === this.page || p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadDepartments();
  }

  /** Pagination */
  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadDepartments();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadDepartments();
    }
  }

  // ===== MODAL STATE =====
  showAddModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editingDeptId: string | null = null;

  // ===== FILTER =====
  nameFilter = '';

  // ===== FORM MODEL (PHỤC VỤ UI, KHÔNG ĐẨY API) =====
  newDepartment: Partial<Department> = {
    name: '',
    description: '',
    status: 'ACTIVE',
    createdBy: '',
  };

  // ===== HANDLERS =====
  handleOpenAddModal(): void {
    this.modalMode = 'add';
    this.showAddModal = true;
    this.newDepartment = {
      name: '',
      description: '',
      status: 'ACTIVE',
      createdBy: '',
    };
  }

  handleOpenEditModal(dept: Department): void {
    this.modalMode = 'edit';
    this.editingDeptId = dept.id;
    this.newDepartment = { ...dept };
    this.showAddModal = true;
  }

  handleCloseModal(): void {
    this.showAddModal = false;
  }

  handleClearFilters(): void {
    this.searchTerm = '';
    this.nameFilter = '';
    this.statusFilter = '';
  }

  handleSaveDepartment(): void {
    if (!this.newDepartment.name?.trim()) {
      alert('Tên phòng ban không được để trống');
      return;
    }

    // CHỈ xử lý CREATE (edit làm sau)
    if (this.modalMode === 'add') {
      const payload = {
        name: this.newDepartment.name,
        description: this.newDepartment.description || '',
      };

      this.departmentService.createDepartment(payload).subscribe({
        next: () => {
          alert('✅ Tạo phòng ban thành công');

          this.showAddModal = false;
          this.page = 1; // quay về trang 1
          this.loadDepartments(); // reload danh sách
        },
        error: (err) => {
          console.error(err);
          alert('❌ Tạo phòng ban thất bại');
        },
      });
    }
  }

  handleToggleStatus(id: string): void {
    alert('⚠️ API toggle status chưa được gắn');
  }

  handleDeleteDepartment(id: string): void {
    if (confirm('Bạn chắc chắn muốn xoá phòng ban này?')) {
      alert('⚠️ API delete chưa được gắn');
    }
  }

  handleViewDepartment(deptId: string): void {
    this.loadingDetail = true;
    this.showDetailModal = true;
    this.isEditMode = false;

    this.departmentService.getDepartmentDetail(deptId).subscribe({
      next: (res) => {
        this.selectedDepartment = res;
        this.loadingDetail = false;
      },
      error: (err) => {
        console.error(err);
        alert('Không thể tải chi tiết phòng ban');
        this.loadingDetail = false;
        this.showDetailModal = false;
      },
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedDepartment = null;
    this.isEditMode = false;
  }

  handleEditDepartment(): void {
    if (!this.selectedDepartment) return;

    this.isEditMode = true;

    this.editForm = {
      name: this.selectedDepartment.name,
      description: this.selectedDepartment.description || '',
    };
  }

  handleUpdateDepartment(): void {
    if (!this.selectedDepartment) return;

    if (!this.editForm.name.trim()) {
      alert('Tên phòng ban không được để trống');
      return;
    }

    this.departmentService
      .updateDepartment(this.selectedDepartment.id, {
        name: this.editForm.name,
        description: this.editForm.description,
      })
      .subscribe({
        next: (res) => {
          alert('✅ Cập nhật phòng ban thành công');

          // Cập nhật lại UI
          this.isEditMode = false;
          this.showDetailModal = false;
          this.loadDepartments();
        },
        error: (err) => {
          console.error(err);
          alert('❌ Cập nhật phòng ban thất bại');
        },
      });
  }

  toggleActionMenu(id: string): void {
    this.openActionId = this.openActionId === id ? null : id;
  }

  changeStatus(dept: Department, status: 'ACTIVE' | 'INACTIVE'): void {
    const confirmMsg =
      status === 'INACTIVE'
        ? 'Bạn có chắc muốn đóng phòng ban này?'
        : 'Bạn có chắc muốn mở lại phòng ban này?';

    if (!confirm(confirmMsg)) return;

    this.departmentService.updateDepartmentStatus(dept.id, status).subscribe({
      next: (res) => {
        alert(res.message); // ✅ thông báo backend trả về
        this.openActionId = null;
        this.loadDepartments(); // reload danh sách
      },
      error: () => {
        alert('❌ Đổi trạng thái thất bại');
      },
    });
  }
}
