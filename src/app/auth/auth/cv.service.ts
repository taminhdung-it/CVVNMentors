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
}
