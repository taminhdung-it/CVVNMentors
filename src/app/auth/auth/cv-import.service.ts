import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CvImportService {
  private READ_EXCEL_API = 'https://cvvnmentors.onrender.com/cv/Readcvexcel';
  private ADD_EXCEL_API = 'https://cvvnmentors.onrender.com/cv/addcvexcel';

  constructor(private http: HttpClient) {}

  /** ===== HEADER CHUẨN BACKEND ===== */
  private buildHeaders(router: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accountid: sessionStorage.getItem('accountid') || '',
      router, // 🔥 RẤT QUAN TRỌNG
    });
  }

  /** ===== READ EXCEL ===== */
  readExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(this.READ_EXCEL_API, formData, {
      headers: this.buildHeaders('cv/readexcel'),
    });
  }

  /** ===== ADD CV FROM EXCEL ===== */
  importCVs(payload: any[]): Observable<any> {
    return this.http.post(this.ADD_EXCEL_API, payload, {
      headers: this.buildHeaders('cv/addexcel'),
    });
  }
}
