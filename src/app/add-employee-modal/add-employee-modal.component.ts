// add-employee-modal.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-employee-modal',
  templateUrl: './add-employee-modal.component.html',
  styleUrls: ['./add-employee-modal.component.css']
})
export class AddEmployeeModalComponent {
  employeeForm: FormGroup;
  loading = false;

  roles = [
    'Chủ cơ sở',
    'Admin',
    'Kế toán',
    'CSKH',
    'Thu ngân',
    'Người xem'
  ];

  departments = [
    'HeadOffice',
    'Chi nhánh 1',
    'Chi nhánh 2',
    'Chi nhánh 3'
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddEmployeeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      department: ['', Validators.required],
      status: ['active', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      this.loading = true;
      
      // Giả lập API call
      setTimeout(() => {
        const formValue = this.employeeForm.value;
        const newEmployee = {
          id: Math.random().toString(36).substr(2, 9),
          name: formValue.name,
          phone: formValue.phone,
          email: formValue.email,
          role: formValue.role,
          department: formValue.department,
          status: formValue.status
        };
        
        this.loading = false;
        this.dialogRef.close(newEmployee);
      }, 1000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.employeeForm.controls).forEach(key => {
        this.employeeForm.get(key)?.markAsTouched();
      });
    }
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