// employee-management.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { EmployeeService } from '../services/employee.service';
import { Employee, Role } from '../models/employee';
import { AddEmployeeModalComponent } from '../add-employee-modal/add-employee-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddRoleDialogComponent } from '../add-role-dialog/add-role-dialog.component';
import { EmployeeDetailModalComponent } from '../employee-detail-modal/employee-detail-modal.component';
import { EmployeeEditModalComponent } from '../employee-edit-modal/employee-edit-modal.component';
import { EmployeeChangePasswordModalComponent } from '../employee-change-password-modal/employee-change-password-modal.component';

@Component({
  selector: 'app-employee-management',
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.css'],
})
export class EmployeeManagementComponent implements OnInit {
  employees: Employee[] = [];
  roles: Role[] = [];
  filteredEmployees: Employee[] = [];

  loading = false;
  rolesLoading = false;

  currentPage = 1;
  pageSize = 20;
  totalEmployees = 0;
  totalPages = 0;

  // Filter states
  searchText = '';
  selectedWorkStatus = '';
  selectedRole = '';
  selectedDateFrom: Date | null = null;
  selectedDateTo: Date | null = null;

  displayedColumns: string[] = [
    'account',
    'role',
    'department',
    'status',
    'actions',
  ];

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadEmployees();
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadEmployees();
  }

  getPages(): number[] {
    const pages: number[] = [];

    // Hiện tối đa 5 trang cho gọn
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  onChangePassword(employee: Employee): void {
    this.dialog.open(EmployeeChangePasswordModalComponent, {
      width: '450px',
      data: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
      },
    });
  }

  loadRoles(): void {
    this.rolesLoading = true;
    this.employeeService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        console.log('Roles loaded:', roles); // Debug
        this.rolesLoading = false;
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        this.rolesLoading = false;
        this.snackBar.open('Không thể tải danh sách vai trò', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  loadEmployees(): void {
    this.loading = true;

    const filters: any = {};

    if (this.searchText?.trim()) {
      filters.search = this.searchText.trim();
    }

    if (this.selectedRole) {
      filters.role = this.selectedRole;
    }

    if (this.selectedWorkStatus) {
      filters.status = this.selectedWorkStatus.toUpperCase();
      // ACTIVE / INACTIVE
    }

    if (this.selectedDateFrom) {
      filters.createdFrom = this.selectedDateFrom.toISOString();
    }

    this.employeeService
      .getEmployees(this.currentPage, this.pageSize, filters)
      .subscribe({
        next: (res) => {
          this.employees = res.data;
          this.filteredEmployees = res.data;

          this.totalEmployees = res.meta.total;
          this.totalPages = res.meta.totalPages;
          this.currentPage = res.meta.page;

          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  onSearch(): void {
    this.currentPage = 1; // reset về trang 1
    this.loadEmployees();
  }

  onFilterChange(): void {
    this.currentPage = 1; // reset về trang 1
    this.loadEmployees();
  }

  onAddEmployee(): void {
    const dialogRef = this.dialog.open(AddEmployeeModalComponent, {
      width: '600px',
      disableClose: false,
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;

      this.employeeService.createEmployee(payload).subscribe({
        next: (res) => {
          this.snackBar.open(
            `Tạo nhân viên thành công – mật khẩu: ${res.defaultPassword}`,
            'Đóng',
            { duration: 5000 }
          );
          this.loadEmployees();
        },
        error: (err) => {
          this.snackBar.open(
            err?.error?.message || 'Tạo nhân viên thất bại',
            'Đóng',
            { duration: 4000 }
          );
        },
      });
    });
  }

  onEditEmployee(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeEditModalComponent, {
      width: '600px',
      data: { id: employee.id },
    });

    dialogRef.afterClosed().subscribe((updated) => {
      if (updated) {
        this.loadEmployees();
      }
    });
  }

  onViewEmployee(employee: Employee): void {
    this.dialog.open(EmployeeDetailModalComponent, {
      width: '600px',
      data: { id: employee.id },
    });
  }

  onDeleteEmployee(employee: Employee): void {
    // Implement delete logic with confirmation dialog
    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên ${employee.name}?`)) {
      console.log('Deleting employee:', employee.id);
      // Call delete API here
    }
  }

  onRoleClick(role: Role): void {
    // Navigate to role permission page
    // Khớp với routing config của bạn
    this.router.navigate(['/employee/role-permission', role.id]);
  }

  getTotalEmployees(): number {
    return this.employees.length;
  }

  formatDate(date: any): string {
    if (!date) return '--';

    try {
      let d: Date;

      // Kiểm tra nếu là Firestore Timestamp object
      if (date._seconds !== undefined) {
        // Convert Firestore Timestamp to JavaScript Date
        d = new Date(date._seconds * 1000);
      }
      // Nếu là Date hoặc string thông thường
      else {
        d = new Date(date);
      }

      if (isNaN(d.getTime())) {
        console.warn('Invalid date:', date);
        return '--';
      }

      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', date, error);
      return '--';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'INACTIVE':
        return 'status-inactive';
      default:
        return 'status-unknown';
    }
  }

  getStatusText(status: string | null | undefined): string {
    // Xử lý null/undefined và trim khoảng trắng
    const s = (status ?? '').trim().toUpperCase();

    switch (s) {
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'INACTIVE':
        return 'Ngưng hoạt động';
      default:
        return 'Không xác định';
    }
  }

  onToggleEmployeeStatus(employee: Employee): void {
    const nextStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const confirmMsg =
      nextStatus === 'INACTIVE'
        ? 'Bạn có chắc chắn muốn khóa tài khoản này?'
        : 'Bạn có chắc chắn muốn mở khóa tài khoản này?';

    if (!confirm(confirmMsg)) return;

    this.employeeService
      .changeEmployeeStatus(employee.id, nextStatus)
      .subscribe({
        next: (res) => {
          // ✅ Thông báo đúng theo backend
          this.snackBar.open(res.message, 'Đóng', {
            duration: 4000,
            panelClass: ['success-snackbar'],
          });

          // ✅ Reload lại danh sách → đồng bộ DB
          this.loadEmployees();
        },
        error: (err) => {
          this.snackBar.open(
            err?.error?.message || 'Đổi trạng thái thất bại',
            'Đóng',
            { duration: 4000, panelClass: ['error-snackbar'] }
          );
        },
      });
  }

  onAddRole(): void {
    const dialogRef = this.dialog.open(AddRoleDialogComponent, {
      width: '500px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      this.loading = true;

      this.employeeService.createEmployee(result).subscribe({
        next: (res) => {
          this.snackBar.open(
            res.message || 'Tạo nhân viên thành công',
            'Đóng',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );

          // 🔥 LOAD LẠI TỪ BACKEND → CÓ createdAt
          this.loadEmployees();
        },
        error: (err) => {
          this.snackBar.open(
            err?.error?.message || 'Tạo nhân viên thất bại',
            'Đóng',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
          this.loading = false;
        },
      });
    });
  }
}
