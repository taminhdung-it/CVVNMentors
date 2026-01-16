// employee-management.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from '../services/employee.service';
import { Employee, Role } from '../models/employee';
import { AddEmployeeModalComponent } from '../add-employee-modal/add-employee-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddRoleDialogComponent } from '../add-role-dialog/add-role-dialog.component';


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
  pageSize = 10;
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
    if (this.searchText) filters.search = this.searchText;
    if (this.selectedRole) filters.role = this.selectedRole;
    if (this.selectedWorkStatus) filters.status = this.selectedWorkStatus;

    this.employeeService
      .getEmployees(this.currentPage, this.pageSize, filters)
      .subscribe({
        next: (response) => {
          this.employees = response.data;
          this.filteredEmployees = response.data;

          // Debug: kiểm tra format date từ API
          console.log(
            'Date formats:',
            this.employees.map((e) => ({
              name: e.name,
              createdAt: e.createdAt,
              type: typeof e.createdAt,
            }))
          );

          this.totalEmployees = response.meta.total;
          this.totalPages = response.meta.totalPages;
          this.currentPage = response.meta.page;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading employees:', err);
          this.loading = false;
        },
      });
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredEmployees = this.employees.filter((emp) => {
      const matchSearch =
        !this.searchText ||
        emp.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        emp.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
        emp.phone.includes(this.searchText);

      const matchRole = !this.selectedRole || emp.role === this.selectedRole;
      const matchStatus =
        !this.selectedWorkStatus || emp.status === this.selectedWorkStatus;

      return matchSearch && matchRole && matchStatus;
    });
  }

  onAddEmployee(): void {
    const dialogRef = this.dialog.open(AddEmployeeModalComponent, {
      width: '600px',
      disableClose: false,
      autoFocus: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Thêm nhân viên mới vào danh sách
        this.employees.push(result);
        this.filteredEmployees = [...this.employees];
        console.log('Nhân viên mới:', result);
        // TODO: Gọi API để lưu vào database
      }
    });
  }

  onEditEmployee(employee: Employee): void {
    // Navigate to edit employee page
    this.router.navigate(['/employees/edit', employee.id]);
  }

  onViewEmployee(employee: Employee): void {
    // Navigate to view employee details page
    this.router.navigate(['/employees/detail', employee.id]);
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

  onToggleEmployeeStatus(employee: any): void {
    employee.status = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  }

  onAddRole(): void {
  const dialogRef = this.dialog.open(AddRoleDialogComponent, {
    width: '500px',
    disableClose: false
  });

  dialogRef.afterClosed().subscribe(roleName => {
    if (roleName) {
      this.employeeService.addRole(roleName).subscribe({
        next: () => {
          this.snackBar.open('Thêm vai trò thành công!', 'Đóng', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadRoles(); // Reload roles list
        },
        error: (err) => {
          console.error('Error adding role:', err);
          this.snackBar.open('Thêm vai trò thất bại!', 'Đóng', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  });
}
}
