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
import { DepartmentManagementComponent } from './department-management/department-management.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: DashboardComponent, data: { title: 'Dashboard' } },
      { path: 'cv', component: CvManagementComponent, data: { title: 'Quản lý CV' } },
      { path: 'cv/import-excel', component: CvImportExcelComponent },
      { path: 'cv/:id', component: CvDetailComponent },

      { path: 'jobmanagement', component: JobManagementComponent, data: { title: 'Quản lý Job' } },

      // 🔽 NEW: Department Management
      {
        path: 'department-management',
        component: DepartmentManagementComponent,
        data: { title: 'Quản lý phòng ban' }
      }
    ]
  },

  { path: '**', redirectTo: 'dashboard' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
