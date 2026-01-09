// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'app_token';
  constructor() {}

  // fake login: lưu token đơn giản vào localStorage
  loginFake(identifier: string, password: string): boolean {
    // demo: chấp nhận bất kỳ credential nào dài >=6
    if (identifier && password && password.length >= 6) {
      localStorage.setItem(this.tokenKey, 'fake-jwt-token');
      localStorage.setItem('user', JSON.stringify({ name: 'Quản trị' }));
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user');
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
