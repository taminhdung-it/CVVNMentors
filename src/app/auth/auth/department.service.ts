import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DepartmentResponse } from '../../models/department.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly API_URL = 'https://cvvnmentors.onrender.com/departments';

  constructor(private http: HttpClient) {}

  getDepartments(page = 1, limit = 10): Observable<DepartmentResponse> {
    const headers = new HttpHeaders({
      accept: 'application/json',
      router: 'department/get',
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken') || ''}`,
    });

    return this.http.get<DepartmentResponse>(
      `${this.API_URL}?page=${page}&limit=${limit}`,
      { headers }
    );
  }

  createDepartment(data: {
    name: string;
    description?: string;
  }): Observable<any> {
    const headers = new HttpHeaders({
      accept: 'application/json',
      'Content-Type': 'application/json',
      router: 'department/add',
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken') || ''}`,
    });

    return this.http.post(this.API_URL, data, { headers });
  }
}
