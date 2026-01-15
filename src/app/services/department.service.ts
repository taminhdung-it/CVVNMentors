import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// ✅ EXPORT interface để dùng ở component
export interface Department {
  id?: number;
  name: string;
  code: string;
  description: string;
  managerId?: number;
  managerName?: string;
  employeeCount?: number;
  createdAt?: Date;
}

export interface DepartmentStats {
  totalDepartments: number;
  totalEmployees: number;
  averageEmployeesPerDepartment: number;
  departmentsWithoutManager: number;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:8080/api/departments';

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createDepartment(department: Department): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, department)
      .pipe(catchError(this.handleError));
  }

  updateDepartment(id: number, department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, department)
      .pipe(catchError(this.handleError));
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getDepartmentStats(): Observable<DepartmentStats> {
    return this.http.get<DepartmentStats>(`${this.apiUrl}/stats`)
      .pipe(catchError(this.handleError));
  }

  // ✅ Xử lý lỗi tập trung
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Đã xảy ra lỗi không xác định!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend.';
          break;
        case 400:
          errorMessage = 'Dữ liệu không hợp lệ.';
          break;
        case 401:
          errorMessage = 'Chưa đăng nhập hoặc phiên đã hết hạn.';
          break;
        case 403:
          errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
          break;
        case 404:
          errorMessage = 'Không tìm thấy dữ liệu.';
          break;
        case 500:
          errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
          break;
        default:
          errorMessage = `Lỗi ${error.status}: ${error.message}`;
      }
    }

    console.error('Error in DepartmentService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}