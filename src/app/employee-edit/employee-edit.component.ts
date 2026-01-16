// employee-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-employee-edit',
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.css']
})
export class EmployeeEditComponent implements OnInit {
  employeeForm: FormGroup;
  employeeId: string = '';
  loading = false;
  saving = false;
  isEditMode = false;

  roles = ['Admin', 'Kế toán', 'CSKH', 'Thu ngân'];
  departments = ['HeadOffice', 'Chi nhánh 1', 'Chi nhánh 2'];
  statusOptions = [
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'INACTIVE', label: 'Ngưng hoạt động' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      department: ['', Validators.required],
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.employeeId = params['id'];
      if (this.employeeId) {
        this.isEditMode = true;
        this.loadMockData();
      }
    });
  }

  loadMockData(): void {
    this.employeeForm.patchValue({
      name: 'Nguyễn Văn A',
      phone: '0987654321',
      email: 'test@example.com',
      role: 'Admin',
      department: 'HeadOffice',
      status: 'ACTIVE'
    });
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      this.saving = true;
      setTimeout(() => {
        this.saving = false;
        this.snackBar.open('Lưu thành công!', 'Đóng', { duration: 2000 });
        this.router.navigate(['/employees']);
      }, 1000);
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }

  onBack(): void {
    this.onCancel();
  }

  // ← Methods thiếu ở đây
  getErrorMessage(field: string): string {
    const control = this.employeeForm.get(field);
    if (control?.hasError('required')) return 'Trường này là bắt buộc';
    if (control?.hasError('email')) return 'Email không hợp lệ';
    return '';
  }

  getPageTitle(): string {
    return this.isEditMode ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên';
  }

  getSubmitButtonText(): string {
    return this.saving ? 'Đang lưu...' : (this.isEditMode ? 'Cập nhật' : 'Thêm');
  }
}