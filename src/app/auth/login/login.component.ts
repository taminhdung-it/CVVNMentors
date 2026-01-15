import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private authservice: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Các trường nhập không được bỏ trống';
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    const { email, password } = this.loginForm.value;

    this.authservice.login(email, password).subscribe({
      next: (res) => {
        sessionStorage.setItem('accesstoken', res.access_token);
        sessionStorage.setItem('refreshtoken', res.refresh_token);
        sessionStorage.setItem('accountid', res.user_id);

        this.loading = false;

        this.snackBar.open('Đăng nhập thành công', 'OK', {
          duration: 1500,
          panelClass: 'snack-success',
        });

        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;

        this.errorMessage = 'Sai email hoặc mật khẩu';

        this.snackBar.open('Đăng nhập thất bại', 'Đóng', {
          duration: 2000,
          panelClass: 'snack-error',
        });
      },
    });
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
  `,
})
export class ForgotPasswordDialog {}
