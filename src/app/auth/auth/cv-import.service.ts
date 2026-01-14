import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CvImportService {
  private READ_EXCEL_API = 'https://cvvnmentors.onrender.com/cv/Readcvexcel';
  private IMPORT_CV_API = 'https://cvvnmentors.onrender.com/cv/addcvexcel';

  constructor(private http: HttpClient) {}

  readExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
    });

    return this.http.post(this.READ_EXCEL_API, formData, { headers });
  }

  /** ✅ LƯU CV ĐÃ PARSE TỪ EXCEL */
  importCVs(payload: any[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      'Content-Type': 'application/json',
    });

    return this.http.post(this.IMPORT_CV_API, payload, { headers });
  }
}
