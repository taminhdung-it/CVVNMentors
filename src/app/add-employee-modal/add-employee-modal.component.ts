// add-employee-modal.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from '../auth/auth/department.service';
import { Department } from '../models/department.model';

@Component({
  selector: 'app-add-employee-modal',
  templateUrl: './add-employee-modal.component.html',
  styleUrls: ['./add-employee-modal.component.css'],
})
export class AddEmployeeModalComponent {
  employeeForm: FormGroup;
  loading = false;

  roles = ['Chủ cơ sở', 'Admin', 'Kế toán', 'CSKH', 'Thu ngân', 'Người xem'];

  departments: Department[] = [];
  loadingDepartments = false;
  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loadingDepartments = true;

    // lấy nhiều để đủ dùng cho select
    this.departmentService.getDepartments(1, 1000).subscribe({
      next: (res) => {
        // chỉ lấy phòng ban đang ACTIVE
        this.departments = res.data.filter((d) => d.status === 'ACTIVE');
        this.loadingDepartments = false;
      },
      error: () => {
        alert('Không tải được danh sách phòng ban');
        this.loadingDepartments = false;
      },
    });
  }

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    public dialogRef: MatDialogRef<AddEmployeeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      address: ['', Validators.required],
      dob: ['', Validators.required], // yyyy-mm-dd
      gender: ['', Validators.required],
      role: ['', Validators.required],
      departmentId: ['', Validators.required],
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.employeeForm.value.name,
      email: this.employeeForm.value.email,
      phone: this.employeeForm.value.phone,
      address: this.employeeForm.value.address,
      dob: this.employeeForm.value.dob,
      gender: this.employeeForm.value.gender,
      role: this.employeeForm.value.role,
      departmentId: this.employeeForm.value.departmentId,
    };

    // ❗ CHỈ TRẢ DATA – KHÔNG GỌI API Ở ĐÂY
    this.dialogRef.close(payload);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.employeeForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Trường này là bắt buộc';
    }
    if (field?.hasError('email')) {
      return 'Email không hợp lệ';
    }
    if (field?.hasError('pattern')) {
      return 'Số điện thoại không hợp lệ (10-11 số)';
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Tối thiểu ${minLength} ký tự`;
    }
    if (field?.hasError('passwordMismatch')) {
      return 'Mật khẩu không khớp';
    }

    return '';
  }
}
