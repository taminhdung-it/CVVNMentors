import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DepartmentManagementComponent } from './department-management.component';

@NgModule({
  declarations: [DepartmentManagementComponent],
  imports: [
    CommonModule,
    FormsModule   // ✅ BẮT BUỘC Ở ĐÂY
  ],
  exports: [DepartmentManagementComponent]
})
export class DepartmentManagementModule {}
