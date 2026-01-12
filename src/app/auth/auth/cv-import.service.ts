import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CvImportService {
  private API_URL = 'https://cvvnmentors.onrender.com/cv/Readcvexcel';

  constructor(private http: HttpClient) {}

  readExcel(file: File): Observable<any> {
    console.log('Uploading file:', file.name);
    const formData = new FormData();
    formData.append('file', file);
    // console.log(`access_token: ${sessionStorage.getItem('accesstoken')} \n refresh_token: ${sessionStorage.getItem('refresh_token')}`);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
    });

    return this.http.post(this.API_URL, formData, { headers });
  }
}
