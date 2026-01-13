import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { CvUploadFileService } from '../auth/auth/cv-upload-file.service';

interface UploadResult {
  fileName: string;
  status: string;
  id: string;
  data?: {
    fullName: string;
    email: string;
    phone: string | null;
    position: string;
    level: string;
    experienceYears: number;
    status: string;
    cvFileUrl: string;
    createdAt: string;
  };
  warning?: string;
}

@Component({
  selector: 'app-cv-import-file',
  templateUrl: './cv-import-file.component.html',
  styleUrls: ['./cv-import-file.component.css'],
})
export class CvImportFileComponent {
  selectedFiles: File[] = [];
  loading = false;

  total = 0;
  success = 0;
  failed = 0;

  results: UploadResult[] = [];

  /** LƯU ID CÁC CV ĐƯỢC CHỌN */
  selectedIds = new Set<string>();

  constructor(
    private location: Location,
    private uploadService: CvUploadFileService
  ) {}

  goBack() {
    this.location.back();
  }

  openPdf(url?: string) {
    if (!url) return;
    window.open(url, '_blank');
  }

  /** CHỌN FILE → AUTO UPLOAD */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;

    this.selectedFiles = Array.from(input.files);
    input.value = '';

    this.uploadFiles(); // 🔥 AUTO UPLOAD
  }

  uploadFiles() {
    this.loading = true;

    const accessToken = sessionStorage.getItem('accesstoken') || '';
    const refreshToken = sessionStorage.getItem('refreshtoken') || '';

    this.uploadService
      .uploadFiles(this.selectedFiles, accessToken, refreshToken)
      .subscribe({
        next: (res: {
          total: number;
          success: number;
          failed: number;
          details: UploadResult[];
        }) => {
          this.total = res.total;
          this.success = res.success;
          this.failed = res.failed;
          this.results = res.details || [];
          this.loading = false;
        },
        error: () => {
          alert('Upload thất bại – kiểm tra token');
          this.loading = false;
        },
      });
  }

  /** CHECKBOX */
  toggleSelect(id: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.selectedIds.add(id);
    } else {
      this.selectedIds.delete(id);
    }
  }

  /** THÊM CV */
  addCv() {
    const selected = this.results.filter((r) => this.selectedIds.has(r.id));

    console.log('CV ĐƯỢC THÊM:', selected);

    alert(`Đã thêm ${selected.length} CV (demo)`);
  }
}
