// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'app_token';
  constructor(private http: HttpClient) { }

  // fake login: lưu token đơn giản vào localStorage
  login(email: string, password: string) {
    return this.http.post<any>(
      "https://cvvnmentors.onrender.com/auth/login",
      {
        email:email,
        password:password
      }
    )
  }

  logout() {
    const accesstoken=sessionStorage.getItem('accesstoken');
    const refreshtoken=sessionStorage.getItem('refreshtoken');
    const accountid=sessionStorage.getItem('accountid');
    const headers=new HttpHeaders({
      Authorization: `Bearer ${accesstoken}`,
      refreshtoken: refreshtoken || ''
    })
    return this.http.post<any>(
      "https://cvvnmentors.onrender.com/auth/logout",
      {
        id:accountid
      }
    )
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // restore session called from app component (optional)
  restoreSessionOnStartup() {
    // keep minimal: nothing to do for now because we use localStorage
    return;
  }
}
