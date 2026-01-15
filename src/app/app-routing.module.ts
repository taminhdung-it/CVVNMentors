// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CvManagementComponent } from './cv-management/cv-management.component';
import { AuthGuard } from './auth/auth/auth.guard';
import { LogoutComponent } from './auth/logout/logout.component';
import { JobManagementComponent } from './job-management/job-management.component';
import { CvDetailComponent } from './cv-detail/cv-detail.component';
import { CvImportExcelComponent } from './cv-import-excel/cv-import-excel.component';
import { CvImportFileComponent } from './cv-import-file/cv-import-file.component';
import { CvAddManualComponent } from './cv-add-manual/cv-add-manual.component';
import { EmployeeManagementComponent } from './employee-management/employee-management.component';
import { RolePermissionComponent } from './role-permission/role-permission.component';



const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' },
      },
      {
        path: 'cv',
        component: CvManagementComponent,
        data: { title: 'Quản lý CV' },
      },
      { path: 'cv/import-file', component: CvImportFileComponent },
      { path: 'cv/import-excel', component: CvImportExcelComponent },
      { path: 'cv/add-manual', component: CvAddManualComponent },
      { path: 'cv/:id', component: CvDetailComponent },

      {
        path: 'jobmanagement',
        component: JobManagementComponent,
        data: { title: 'Quản lý Job' },
      },

      {
        path: 'employee',
        component: EmployeeManagementComponent,
        data: { title: 'Quản lý Nhân viên' },
      },
      { path: 'employee/role-permission', component: RolePermissionComponent },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
