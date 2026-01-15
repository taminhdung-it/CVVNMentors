// services/employee.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Employee, Role } from '../models/employee';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private mockEmployees: Employee[] = [
    {
      id: '1',
      name: 'Nhân viên 1',
      phone: '0987345123',
      email: 'nhanvien1@gmail.com',
      role: 'Kế toán',
      department: 'HeadOffice',
      status: 'active'
    },
    {
      id: '2',
      name: 'Nhân viên 2',
      phone: '0987345123',
      email: 'nhanvien2@gmail.com',
      role: 'Kế toán',
      department: 'HeadOffice',
      status: 'active'
    },
    {
      id: '3',
      name: 'Nhân viên 3',
      phone: '0987345123',
      email: 'nhanvien3@gmail.com',
      role: 'Kế toán',
      department: 'HeadOffice',
      status: 'active'
    },
    {
      id: '4',
      name: 'Nhân viên 4',
      phone: '0987345123',
      email: 'nhanvien4@gmail.com',
      role: 'Kế toán',
      department: 'HeadOffice',
      status: 'active'
    },
    {
      id: '5',
      name: 'Nhân viên 5',
      phone: '0987345123',
      email: 'nhanvien5@gmail.com',
      role: 'Kế toán',
      department: 'HeadOffice',
      status: 'active'
    },
    {
      id: '6',
      name: 'Nhân viên 6',
      phone: '0987345123',
      email: 'nhanvien6@gmail.com',
      role: 'Kế toán',
      department: 'HeadOffice',
      status: 'active'
    },
    {
      id: '7',
      name: 'Nhân viên 7',
      phone: '0987345123',
      email: 'nhanvien7@gmail.com',
      role: 'Kế toán',
      department: 'HeadOffice',
      status: 'active'
    }
  ];

  private mockRoles: Role[] = [
    { id: '1', name: 'Chủ cơ sở', employeeCount: 7 },
    { id: '2', name: 'Admin', employeeCount: 7 },
    { id: '3', name: 'Kế toán', employeeCount: 7 },
    { id: '4', name: 'CSKH', employeeCount: 7 },
    { id: '5', name: 'Thu ngân', employeeCount: 7 },
    { id: '6', name: 'Người xem', employeeCount: 7 }
  ];

  getEmployees(): Observable<Employee[]> {
    return of(this.mockEmployees).pipe(delay(500));
  }

  getRoles(): Observable<Role[]> {
    return of(this.mockRoles).pipe(delay(300));
  }

  getEmployeeById(id: string): Observable<Employee | undefined> {
    return of(this.mockEmployees.find(emp => emp.id === id)).pipe(delay(300));
  }
}