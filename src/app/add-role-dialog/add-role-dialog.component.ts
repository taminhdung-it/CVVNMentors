// add-role-dialog.component.ts
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-role-dialog',
  template: `
    <h2 mat-dialog-title>Thêm vai trò mới</h2>
    <mat-dialog-content>
      <form [formGroup]="roleForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tên vai trò</mat-label>
          <input matInput formControlName="name" placeholder="Nhập tên vai trò">
          <mat-error *ngIf="roleForm.get('name')?.hasError('required')">
            Tên vai trò là bắt buộc
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Hủy</button>
      <button mat-raised-button color="primary" 
              (click)="onSubmit()"
              [disabled]="!roleForm.valid">
        Thêm
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
    mat-dialog-content {
      min-width: 400px;
      padding: 20px 0;
    }
  `]
})
export class AddRoleDialogComponent {
  roleForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddRoleDialogComponent>,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      this.dialogRef.close(this.roleForm.value.name);
    }
  }
}