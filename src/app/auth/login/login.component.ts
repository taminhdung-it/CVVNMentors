import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
  if (this.loginForm.invalid) {
    this.errorMessage = 'Các trường nhập không được bỏ trống';
    return;
  }

  const { email, password } = this.loginForm.value;

  // MOCK LOGIN – sau này thay API
  if (email !== 'admin@gmail.com' || password !== '12345') {
    this.errorMessage = 'Tài khoản hoặc mật khẩu không chính xác';
    return;
  }

  // === LƯU SESSION ===
  sessionStorage.setItem(
    'auth',
    JSON.stringify({
      token: 'mock-token',
      user: { email },
      permissions: ['dashboard.view']
    })
  );

  this.errorMessage = '';
  this.snackBar.open('Đăng nhập thành công', 'Đóng', {
    duration: 2000
  });

  setTimeout(() => {
    this.router.navigate(['/dashboard']);
  }, 500);
}


  openForgotPassword() {
    this.dialog.open(ForgotPasswordDialog);
  }
}

@Component({
  template: `
    <h2 mat-dialog-title>Quên mật khẩu</h2>
    <mat-dialog-content>
      <p>
        Mày nghĩ mày có quyền đổi mật khẩu à.<br />
        Cầu xin quản lý mở cho đi nha 🙏
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Đồng ý</button>
    </mat-dialog-actions>
  `
})
export class ForgotPasswordDialog {}
