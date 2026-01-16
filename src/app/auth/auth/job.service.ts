import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JobApi } from 'src/app/models/job.model';
import { ApplicationStatus } from 'src/app/job-management/job-management.component';
import { CreateJobPayload } from 'src/app/models/job-create.model';

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
  private API_URL = 'https://cvvnmentors.onrender.com';

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

  // ================= JOB DETAIL =================
  getJobDetail(jobId: string): Observable<JobApi> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'job/getone',
    });

    return this.http.get<JobApi>(`${this.API}/${jobId}`, { headers });
  }

  // ================= APPLICATIONS BY JOB =================
  getApplicationsByJob(
    jobId: string,
    status?: string,
    page = 1,
    limit = 10
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'application/get',
    });

    let url = `https://cvvnmentors.onrender.com/applications/job/${jobId}?page=${page}&limit=${limit}`;

    if (status) {
      url += `&status=${status}`;
    }

    return this.http.get(url, { headers });
  }

  // ================= APPLICATION DETAIL =================
  getApplicationDetail(applicationId: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'application/getone',
    });

    return this.http.get(
      `https://cvvnmentors.onrender.com/applications/${applicationId}`,
      { headers }
    );
  }

  // ================= UPDATE APPLICATION =================
  updateApplication(
    applicationId: string,
    payload: {
      interviewScheduled?: string | null;
      feedback?: string | null;
      rating?: number | null;
      rejectionReason?: string | null;
    }
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'application/edit',
      'Content-Type': 'application/json',
    });

    return this.http.patch(
      `https://cvvnmentors.onrender.com/applications/${applicationId}`,
      payload,
      { headers }
    );
  }

  // ================= UPDATE APPLICATION STATUS =================
  updateApplicationStatus(
    id: string,
    payload: {
      status: ApplicationStatus;
      rejectionReason?: string;
    }
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'application/changestatus',
      'Content-Type': 'application/json',
    });

    return this.http.patch(
      `https://cvvnmentors.onrender.com/applications/${id}/status`,
      payload,
      { headers }
    );
  }

  createJob(payload: CreateJobPayload, jdFile?: File) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'job/add',
    });

    const formData = new FormData();

    formData.append('departmentId', payload.departmentId);
    formData.append('name', payload.name);
    formData.append('description', payload.description);
    formData.append('headcountTarget', String(payload.headcountTarget));
    formData.append('applyStart', payload.applyStart);
    formData.append('applyEnd', payload.applyEnd);

    payload.skills.forEach((s) => formData.append('skills', s));

    if (jdFile) {
      formData.append('file', jdFile);
    }

    return this.http.post('https://cvvnmentors.onrender.com/jobs', formData, {
      headers,
    });
  }
}
