import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CvDetailResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  position: string;
  level: string;
  status: 'NEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  cvFileUrl: string;
  cvType?: string; // ✅ THÊM DÒNG NÀY
  publicId?: string; // (optional – backend có)
  createdBy?: any;
  createdAt: any;
  updatedAt: string;
  skills: string[];
  education: any[];
  experienceYears: number;
  experience: {
    title: string;
    dates: string | null;
    location: string | null;
    organization: string;
  }[];
}

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
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'cv/get',
    });
  }

  /** ASSIGN JOB – ĐÚNG THEO DOC */
  /** ASSIGN JOB – ĐÚNG API BACKEND */
  assignJobToCvs(jobId: string, cvIds: string[]) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'cv/assign',
      accept: 'application/json',
    });

    return this.http.post(
      `${this.API}/assign-job`,
      {
        jobId,
        cvIds,
      },
      { headers }
    );
  }

  getJobs(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'job/get',
    });

    return this.http.get('https://cvvnmentors.onrender.com/jobs', { headers });
  }

  /** GET CV – phân trang */
  getCvs(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.API}?page=${page}&limit=${limit}`, {
      headers: this.getHeaders(),
    });
  }

  /** ASSIGN JOB */
  assignJob(id: string, job: string) {
    return this.http.patch(
      `${this.API}/${id}/assign-job`,
      { job },
      { headers: this.getHeaders() }
    );
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
  /** ✅ CV DETAIL */
  getCvDetail(cvId: string): Observable<CvDetailResponse> {
    return this.http.get<CvDetailResponse>(`${this.API}/${cvId}`, {
      headers: this.getHeaders(),
    });
  }

  /** UPDATE CV INFO */
  updateCvInfo(id: string, payload: any) {
    return this.http.patch(`${this.API}/${id}`, payload, {
      headers: this.getHeaders(),
    });
  }

  /** 🔥 LỊCH SỬ ỨNG TUYỂN CỦA CV */
  getApplicationsByCv(
    cvId: string,
    page: number = 1,
    limit: number = 10
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'application/get',
    });

    return this.http.get(
      `https://cvvnmentors.onrender.com/applications/cv/${cvId}?page=${page}&limit=${limit}`,
      { headers }
    );
  }
}

@Injectable({ providedIn: 'root' })
export class CvUploadFileService {
  private API = 'https://cvvnmentors.onrender.com/cv/upload';

  constructor(private http: HttpClient) {}

  uploadFiles(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router: 'cv/readpdfdoc',
      // ❗ KHÔNG set Content-Type
    });

    return this.http.post(this.API, formData, { headers });
  }
}
