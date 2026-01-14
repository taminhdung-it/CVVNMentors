import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CvManualService {
  private API = 'https://cvvnmentors.onrender.com/cv';

  constructor(private http: HttpClient) {}

  createManualCv(formData: FormData): Observable<any> {
    return this.http.post(this.API, formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
        refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      }),
    });
  }
}
