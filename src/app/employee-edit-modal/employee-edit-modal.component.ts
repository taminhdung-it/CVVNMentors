import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../services/employee.service';
import { DepartmentService } from '../auth/auth/department.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Employee } from '../models/employee';
import { Department } from '../models/department.model';

@Component({
  selector: 'app-employee-edit-modal',
  templateUrl: './employee-edit-modal.component.html',
  styleUrls: ['./employee-edit-modal.component.css'],
})
export class EmployeeEditModalComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  employee!: Employee;
  departments: Department[] = [];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<EmployeeEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string }
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDepartments();
    this.loadEmployeeDetail();
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      gender: [''],
      address: [''],
      role: ['', Validators.required],
      departmentId: ['', Validators.required],
    });
  }

  loadEmployeeDetail(): void {
    this.employeeService.getEmployeeDetail(this.data.id).subscribe({
      next: (emp) => {
        this.form.patchValue({
          name: emp.name,
          email: emp.email,
          phone: emp.phone,
          gender: emp.gender,
          address: emp.address,
          role: emp.role,
          departmentId: emp.departmentId,
        });
      },
      error: () => {
        alert('Không thể tải thông tin nhân viên');
        this.dialogRef.close();
      },
    });
  }

  loadDepartments(): void {
    this.departmentService.getDepartments(1, 100).subscribe({
      next: (res) => {
        this.departments = res.data;
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    const payload: any = {};

    if (raw.name) payload.name = raw.name;
    if (raw.phone) payload.phone = raw.phone;
    if (raw.gender) payload.gender = raw.gender;
    if (raw.address) payload.address = raw.address;
    if (raw.role) payload.role = raw.role;
    if (raw.departmentId) payload.departmentId = raw.departmentId;

    this.employeeService.updateEmployee(this.data.id, payload).subscribe({
      next: (res) => {
        this.snackBar.open(res.message || 'Cập nhật thành công', 'Đóng', {
          duration: 3000,
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Cập nhật thất bại', 'Đóng', {
          duration: 4000,
        });
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
