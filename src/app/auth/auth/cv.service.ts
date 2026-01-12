import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CvService {
  private API_URL = 'https://cvvnmentors.onrender.com/cv';

  constructor(private http: HttpClient) {}

  getCVs(page: number, limit: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('accesstoken')}`,
      refreshtoken: sessionStorage.getItem('refreshtoken') || '',
      accept: 'application/json',
    });

    const params = new HttpParams().set('page', page).set('limit', limit);

    return this.http.get(this.API_URL, { headers, params });
  }
}
