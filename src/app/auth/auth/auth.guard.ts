// src/app/auth/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const auth = sessionStorage.getItem('auth');

    if (!auth) {
      // 👉 QUAN TRỌNG: redirect về login
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
