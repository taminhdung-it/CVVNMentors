import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-logout',
  template: '',
})
export class LogoutComponent implements OnInit {
  errorMessage = '';
  constructor(private router: Router,
    private authservice:AuthService
  ) {}

  ngOnInit(): void {
    this.authservice.logout().subscribe({
      next:(res)=>{
        sessionStorage.clear()
        this.router.navigate(['/login']);
      },
      error:(res)=>{
        console.log(res.error.message)
        this.errorMessage=`Đăng xuất không thành công`;
      }
    })
  }
}
