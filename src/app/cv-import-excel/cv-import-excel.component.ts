import { Component } from '@angular/core';

interface ImportCV {
  fullName: string;
  email: string;
  status: 'Mới' | 'Lỗi' | 'Trùng lặp';
  job?: string;
  updatedAt: string;
  phone: string;
}

@Component({
  selector: 'app-cv-import-excel',
  templateUrl: './cv-import-excel.component.html',
  styleUrls: ['./cv-import-excel.component.css'],
})
export class CvImportExcelComponent {
  /** FILE */
  file: File | null = null;

  /** RESULT */
  cvs: ImportCV[] = [];

  /** STATS */
  found = 0;
  duplicated = 0;
  error = 0;

  /** UI */
  expanded = true;

  /** MOCK IMPORT (GIẢ LẬP BACKEND) */
  onFileSelected(event: any) {
    this.file = event.target.files[0];
    if (!this.file) return;

    // giả lập đọc excel
    setTimeout(() => {
      this.cvs = [
        {
          fullName: 'Đào Quốc Sơn Hà',
          email: 'sonhadaoquoc@gmail.com',
          status: 'Mới',
          job: '-',
          updatedAt: '31/12/2025',
          phone: '0927000888',
        },
        {
          fullName: 'Nguyễn Minh Dương',
          email: 'duong@gmail.com',
          status: 'Trùng lặp',
          job: '-',
          updatedAt: '31/12/2025',
          phone: '0912345678',
        },
        {
          fullName: 'Test Error',
          email: 'sai-email',
          status: 'Lỗi',
          job: '-',
          updatedAt: '31/12/2025',
          phone: '',
        },
      ];

      this.calculateStats();
    }, 600);
  }

  calculateStats() {
    this.found = this.cvs.filter(c => c.status === 'Mới').length;
    this.duplicated = this.cvs.filter(c => c.status === 'Trùng lặp').length;
    this.error = this.cvs.filter(c => c.status === 'Lỗi').length;
  }

  downloadTemplate() {
    alert('Tải file Excel mẫu (.xlsx)');
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  getStatusClass(status: string) {
    if (status === 'Mới') return 'status-new';
    if (status === 'Trùng lặp') return 'status-duplicate';
    return 'status-error';
  }
}
