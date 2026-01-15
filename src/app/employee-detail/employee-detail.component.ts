// employee-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../models/employee';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  employeeId: string = '';
  loading = false;
  deleting = false;

  // Activity logs mock data
  activityLogs = [
    {
      id: '1',
      action: 'Đăng nhập hệ thống',
      timestamp: new Date('2025-01-15T08:30:00'),
      description: 'Đăng nhập thành công từ IP 192.168.1.100'
    },
    {
      id: '2',
      action: 'Cập nhật thông tin khách hàng',
      timestamp: new Date('2025-01-15T10:15:00'),
      description: 'Cập nhật thông tin khách hàng #KH001'
    },
    {
      id: '3',
      action: 'Tạo đơn hàng mới',
      timestamp: new Date('2025-01-15T14:20:00'),
      description: 'Tạo đơn hàng #DH12345'
    },
    {
      id: '4',
      action: 'Xuất báo cáo',
      timestamp: new Date('2025-01-14T16:45:00'),
      description: 'Xuất báo cáo doanh thu tháng 1'
    }
  ];

  // Work schedule mock data
  workSchedule = [
    { day: 'Thứ 2', shift: 'Sáng: 8:00 - 12:00, Chiều: 13:00 - 17:00' },
    { day: 'Thứ 3', shift: 'Sáng: 8:00 - 12:00, Chiều: 13:00 - 17:00' },
    { day: 'Thứ 4', shift: 'Sáng: 8:00 - 12:00, Chiều: 13:00 - 17:00' },
    { day: 'Thứ 5', shift: 'Sáng: 8:00 - 12:00, Chiều: 13:00 - 17:00' },
    { day: 'Thứ 6', shift: 'Sáng: 8:00 - 12:00, Chiều: 13:00 - 17:00' },
    { day: 'Thứ 7', shift: 'Nghỉ' },
    { day: 'Chủ nhật', shift: 'Nghỉ' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.employeeId = params['id'];
      this.loadEmployeeDetail();
    });
  }

  loadEmployeeDetail(): void {
    this.loading = true;
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (employee) => {
        this.employee = employee || null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading employee:', err);
        this.loading = false;
        this.snackBar.open('Không thể tải thông tin nhân viên', 'Đóng', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/employees']);
  }

  onEdit(): void {
    this.router.navigate(['/employees/edit', this.employeeId]);
  }

  onDelete(): void {
    if (!this.employee) return;

    const confirmed = confirm(`Bạn có chắc chắn muốn xóa nhân viên ${this.employee.name}?`);
    
    if (confirmed) {
      this.deleting = true;
      
      // Giả lập API call
      setTimeout(() => {
        this.deleting = false;
        this.snackBar.open('Xóa nhân viên thành công!', 'Đóng', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/employees']);
      }, 1000);
    }
  }

  onResetPassword(): void {
    if (!this.employee) return;

    const confirmed = confirm(`Bạn có muốn reset mật khẩu cho nhân viên ${this.employee.name}?`);
    
    if (confirmed) {
      // Giả lập API call
      this.snackBar.open('Đã gửi email reset mật khẩu!', 'Đóng', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    }
  }

  getStatusText(status: string): string {
    return status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}