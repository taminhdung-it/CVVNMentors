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
    const accesstoken = sessionStorage.getItem('accesstoken');
    const refreshtoken = sessionStorage.getItem('refreshtoken');
    const uesrid = sessionStorage.getItem('accountid');

    if (!accesstoken || !refreshtoken || !uesrid) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
