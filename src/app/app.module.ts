// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module'; 

// ============================================
// ANGULAR MATERIAL MODULES
// ============================================
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu'; // ⭐ THIẾU MODULE NÀY
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';

// ============================================
// COMPONENTS
// ============================================
import { AppComponent } from './app.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CvManagementComponent } from './cv-management/cv-management.component';
import { ForgotPasswordDialog, LoginComponent } from './auth/login/login.component';
import { JobManagementComponent } from './job-management/job-management.component';

import { CvService } from './services/cv.service';
import { AuthService } from './services/auth.service';
import { CvDetailComponent } from './cv-detail/cv-detail.component';
import { CvImportExcelComponent } from './cv-import-excel/cv-import-excel.component';
import { DepartmentManagementModule } from './department-management/department-management.module';

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    HeaderComponent,
    SidebarComponent,
    DashboardComponent,
    CvManagementComponent,
    JobManagementComponent,
    LoginComponent,
    ForgotPasswordDialog,
    CvDetailComponent,
    CvImportExcelComponent,

  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    DepartmentManagementModule, // ⭐ ĐỂ ROUTING MODULE Ở ĐÂY (XÓA RouterModule.forRoot bên dưới)

    // ============================================
    // ANGULAR MATERIAL MODULES
    // ============================================
    MatDialogModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatSnackBarModule,
    MatMenuModule, // ⭐ THÊM MODULE NÀY
    MatProgressSpinnerModule,
    MatDividerModule,
    MatBadgeModule,
    MatChipsModule
  ],
  providers: [CvService,
    AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }