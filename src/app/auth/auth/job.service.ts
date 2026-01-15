import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobApi } from 'src/app/models/job.model';

export interface JobApiResponse {
  data: JobApi[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/* ================= SERVICE ================= */
@Injectable({
  providedIn: 'root',
})
export class JobService {
  private API = 'https://cvvnmentors.onrender.com/jobs';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    return new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'job/get',
    });
  }

  getJobs(page = 1, limit = 10): Observable<JobApiResponse> {
    return this.http.get<JobApiResponse>(
      `${this.API}?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  // ================= JOB STATUS =================
  closeJob(jobId: string, reason: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'job/close',
      'Content-Type': 'application/json',
    });

    return this.http.patch(
      `${this.API}/${jobId}/close`,
      { reason },
      { headers }
    );
  }

  // ================= JOB STATUS =================
  openJob(jobId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'job/open',
    });

    return this.http.patch(
      `${this.API}/${jobId}/open`,
      {}, // ❗ API open KHÔNG cần body
      { headers }
    );
  }

  // ================= JOB STATUS =================
  lockJob(jobId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'job/lock',
    });

    return this.http.patch(
      `${this.API}/${jobId}/lock`,
      {}, // ❗ KHÔNG body → đúng với API khoá tạm
      { headers }
    );
  }
}
