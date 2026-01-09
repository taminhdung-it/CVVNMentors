// src/app/auth/logout/logout.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  template: '',
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Clear auth data
    sessionStorage.clear();
    localStorage.removeItem('qlcv_session');
    localStorage.removeItem('QL_CV_TOKEN');

    // Redirect to login
    this.router.navigate(['/login']);
  }
}
