// employee-management.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from '../services/employee.service';
import { Employee, Role } from '../models/employee';
import { AddEmployeeModalComponent } from '../add-employee-modal/add-employee-modal.component';

@Component({
  selector: 'app-employee-management',
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.css']
})
export class EmployeeManagementComponent implements OnInit {
  employees: Employee[] = [];
  roles: Role[] = [];
  filteredEmployees: Employee[] = [];
  
  loading = false;
  rolesLoading = false;
  
  // Filter states
  searchText = '';
  selectedWorkStatus = '';
  selectedRole = '';
  selectedDateFrom: Date | null = null;
  selectedDateTo: Date | null = null;

  displayedColumns: string[] = ['account', 'role', 'department', 'status', 'actions'];

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private dialog: MatDialog
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
        this.rolesLoading = false;
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        this.rolesLoading = false;
      }
    });
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.filteredEmployees = employees;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredEmployees = this.employees.filter(emp => {
      const matchSearch = !this.searchText || 
        emp.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        emp.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
        emp.phone.includes(this.searchText);
      
      const matchRole = !this.selectedRole || emp.role === this.selectedRole;
      const matchStatus = !this.selectedWorkStatus || emp.status === this.selectedWorkStatus;
      
      return matchSearch && matchRole && matchStatus;
    });
  }

  onAddEmployee(): void {
    const dialogRef = this.dialog.open(AddEmployeeModalComponent, {
      width: '600px',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
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
    this.router.navigate(['/employee/role-permission']);
  }

  getTotalEmployees(): number {
    return this.employees.length;
  }
}