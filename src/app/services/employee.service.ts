// services/employee.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Employee, Role, ApiResponse } from '../models/employee';
import { 
  RoleApiResponse, 
  RoleEditRequest, 
  RoleAddRequest,
  RolePermissions 
} from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'https://cvvnmentors.onrender.com';

  constructor(private http: HttpClient) {}

  private getHeaders(router: string = 'user/get'): HttpHeaders {
    const accessToken = sessionStorage.getItem('accesstoken');
    const refreshToken = sessionStorage.getItem('refreshtoken');
    const accountId = sessionStorage.getItem('accountid');
    
    return new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`,
      'refreshtoken': refreshToken || '',
      'accountid': accountId || '',
      'router': router
    });
  }

  // ... các methods cũ giữ nguyên ...

  getEmployees(page: number = 1, limit: number = 10, filters?: {
    search?: string;
    role?: string;
    status?: string;
  }): Observable<ApiResponse<Employee[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.role) {
      params = params.set('role', filters.role);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    const headers = this.getHeaders('user/get');
    
    return this.http.get<ApiResponse<Employee[]>>(`${this.apiUrl}/users`, { headers, params })
      .pipe(
        map(response => {
          response.data = response.data.map((emp: any) => ({
            ...emp,
            createdAt: emp.createdAt?._seconds 
              ? new Date(emp.createdAt._seconds * 1000) 
              : emp.createdAt,
            updatedAt: emp.updatedAt?._seconds 
              ? new Date(emp.updatedAt._seconds * 1000) 
              : emp.updatedAt
          }));
          return response;
        })
      );
  }

  getRoles(): Observable<Role[]> {
    const headers = this.getHeaders('role/get');

    return this.http.get<RoleApiResponse>(`${this.apiUrl}/role/get`, { headers })
      .pipe(
        map(response => {
          const roles: Role[] = [];
          
          if (response.role) {
            const roleNames = Object.keys(response.role);
            
            roleNames.forEach((roleName, index) => {
              roles.push({
                id: roleName, // Dùng tên role làm ID
                name: this.formatRoleName(roleName),
                employeeCount: 0
              });
            });
          }
          
          return roles;
        })
      );
  }

  // ← MỚI: Lấy permissions của 1 role cụ thể
  getRolePermissions(roleId: string): Observable<RolePermissions> {
    const headers = this.getHeaders('role/get');

    return this.http.get<RoleApiResponse>(`${this.apiUrl}/role/get`, { headers })
      .pipe(
        map(response => {
          // Tìm role theo ID
          if (response.role && response.role[roleId]) {
            return response.role[roleId];
          }
          return {};
        })
      );
  }

  // ← MỚI: Thêm role mới
  addRole(roleName: string): Observable<any> {
    const headers = this.getHeaders('role/add');
    const body: RoleAddRequest = { name: roleName };

    return this.http.post(`${this.apiUrl}/role/add`, body, { headers });
  }

  // ← MỚI: Cập nhật permissions của role
  updateRolePermissions(roleId: string, permissions: RolePermissions): Observable<any> {
    const headers = this.getHeaders('role/edit');
    
    const body: RoleEditRequest = {
      groupName: roleId, // Hoặc "default" nếu API yêu cầu
      data: permissions
    };

    return this.http.put(`${this.apiUrl}/role/edit`, body, { headers });
  }

  // ← MỚI: Xóa role
  deleteRole(roleId: string): Observable<any> {
    const headers = this.getHeaders('role/delete');

    return this.http.delete(`${this.apiUrl}/role/delete/${roleId}`, { headers });
  }

  private formatRoleName(roleName: string): string {
    const roleMap: { [key: string]: string } = {
      'user': 'Người dùng',
      'admin': 'Quản trị viên',
      'accountant': 'Kế toán',
      'customer_service': 'CSKH',
      'cashier': 'Thu ngân',
      'viewer': 'Người xem',
      'default': 'Mặc định'
    };
    
    return roleMap[roleName] || roleName;
  }
}