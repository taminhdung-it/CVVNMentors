// employee-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit {
  employeeId: string = '';
  loading = false;
  
  // Mock data
  employee = {
    id: '1',
    name: 'Nguyễn Văn A',
    phone: '0987654321',
    email: 'test@example.com',
    role: 'Admin',
    departmentId: 'HeadOffice',
    status: 'ACTIVE'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.params['id'];
  }

  onBack(): void {
    this.router.navigate(['/employees']);
  }

  onEdit(): void {
    this.router.navigate(['/employees/edit', this.employeeId]);
  }

  onDelete(): void {
    if (confirm(`Bạn có chắc muốn xóa nhân viên ${this.employee.name}?`)) {
      this.snackBar.open('Xóa thành công!', 'Đóng', { duration: 2000 });
      this.router.navigate(['/employees']);
    }
  }

  getStatusText(status: string): string {
    return status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngưng hoạt động';
  }

  getStatusClass(status: string): string {
    return status === 'ACTIVE' ? 'active' : 'inactive';
  }
}