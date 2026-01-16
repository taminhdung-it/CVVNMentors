import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmployeeService } from '../services/employee.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DepartmentService } from '../auth/auth/department.service';
import { Department } from '../models/department.model';

@Component({
  selector: 'app-employee-detail-modal',
  templateUrl: './employee-detail-modal.component.html',
  styleUrls: ['./employee-detail-modal.component.css'],
})
export class EmployeeDetailModalComponent implements OnInit {
  loading = true;
  employee: any = null;
  departments: Department[] = [];
  departmentMap: Record<string, string> = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: string },
    private dialogRef: MatDialogRef<EmployeeDetailModalComponent>,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployeeDetail();
  }

  loadDepartments(): void {
    this.departmentService.getDepartments(1, 100).subscribe({
      next: (res) => {
        this.departments = res.data;

        // 🔥 map departmentId → departmentName
        this.departmentMap = {};
        res.data.forEach((d) => {
          this.departmentMap[d.id] = d.name;
        });
      },
      error: () => {
        console.error('Không tải được danh sách phòng ban');
      },
    });
  }

  loadEmployeeDetail(): void {
    this.loading = true;

    this.employeeService.getEmployeeDetail(this.data.id).subscribe({
      next: (res) => {
        this.employee = res;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(
          err?.error?.message || 'Không thể tải chi tiết nhân viên',
          'Đóng',
          { duration: 4000 }
        );
        this.dialogRef.close();
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  formatDate(date: any): string {
    if (!date) return '--';

    if (date._seconds) {
      return new Date(date._seconds * 1000).toLocaleDateString('vi-VN');
    }

    return new Date(date).toLocaleDateString('vi-VN');
  }

  getStatusText(status: string): string {
    return status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngưng hoạt động';
  }

  getDepartmentName(departmentId?: string): string {
    if (!departmentId) return '—';
    return this.departmentMap[departmentId] || departmentId;
  }
}
