// employee-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../services/employee.service';
import { Employee } from '../models/employee';

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

  statusOptions = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Ngừng hoạt động' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      department: ['', Validators.required],
      status: ['active', Validators.required],
      address: [''],
      dateOfBirth: [''],
      joinDate: [''],
      salary: ['', [Validators.pattern(/^[0-9]+$/)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.employeeId = params['id'];
      if (this.employeeId) {
        this.isEditMode = true;
        this.loadEmployeeData();
      }
    });
  }

  loadEmployeeData(): void {
    this.loading = true;
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (employee) => {
        if (employee) {
          this.employeeForm.patchValue({
            name: employee.name,
            phone: employee.phone,
            email: employee.email,
            role: employee.role,
            department: employee.department,
            status: employee.status
          });
        }
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

  onSubmit(): void {
    if (this.employeeForm.valid) {
      this.saving = true;

      const formValue = this.employeeForm.value;
      const employeeData: Employee = {
        id: this.employeeId || Math.random().toString(36).substr(2, 9),
        name: formValue.name,
        phone: formValue.phone,
        email: formValue.email,
        role: formValue.role,
        department: formValue.department,
        status: formValue.status
      };

      // Giả lập API call
      setTimeout(() => {
        this.saving = false;
        
        const message = this.isEditMode 
          ? 'Cập nhật nhân viên thành công!' 
          : 'Thêm nhân viên thành công!';
        
        this.snackBar.open(message, 'Đóng', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Navigate back to employee list or detail
        if (this.isEditMode) {
          this.router.navigate(['/employees/detail', this.employeeId]);
        } else {
          this.router.navigate(['/employees']);
        }
      }, 1000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.employeeForm.controls).forEach(key => {
        this.employeeForm.get(key)?.markAsTouched();
      });
      
      this.snackBar.open('Vui lòng kiểm tra lại thông tin', 'Đóng', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  onCancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/employees/detail', this.employeeId]);
    } else {
      this.router.navigate(['/employees']);
    }
  }

  onBack(): void {
    this.onCancel();
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
      if (fieldName === 'phone') {
        return 'Số điện thoại không hợp lệ (10-11 số)';
      }
      if (fieldName === 'salary') {
        return 'Lương phải là số';
      }
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Tối thiểu ${minLength} ký tự`;
    }
    
    return '';
  }

  getPageTitle(): string {
    return this.isEditMode ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới';
  }

  getSubmitButtonText(): string {
    if (this.saving) {
      return 'Đang lưu...';
    }
    return this.isEditMode ? 'Cập nhật' : 'Thêm nhân viên';
  }
}