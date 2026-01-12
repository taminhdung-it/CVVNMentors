import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CvService {
  private API = 'https://cvvnmentors.onrender.com/cv';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
    });
  }

  /** GET CV – phân trang */
  getCvs(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.API}?page=${page}&limit=${limit}`, {
      headers: this.getHeaders(),
    });
  }

  /** ASSIGN JOB */
  assignJob(id: string, job: string) {
    return this.http.patch(`/api/cvs/${id}/assign-job`, { job });
  }

  /** UPDATE STATUS */
  updateStatus(
    cvId: string,
    status: 'NEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED'
  ) {
    return this.http.patch(
      `${this.API}/${cvId}/status`,
      { status },
      { headers: this.getHeaders() }
    );
  }
}
