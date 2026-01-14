import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { CvUploadFileService } from '../auth/auth/cv-upload-file.service';

interface UploadResult {
  fileName: string;
  status: string;
  id: string;
  isDuplicate?: boolean; // ✅ thêm
  duplicateWith?: string[]; // ✅ thêm
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
  loading = false;

  /** thống kê */
  success = 0;
  failed = 0;

  /** kết quả parse */
  results: UploadResult[] = [];

  /** 🔍 tìm kiếm */
  keyword = '';

  /** 🔽 filter */
  filterType: 'ALL' | 'DUPLICATE' = 'ALL';

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

  /** upload */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;

    const files = Array.from(input.files);

    if (files.length > 10) {
      alert('Chỉ được upload tối đa 10 file');
      input.value = '';
      return;
    }

    input.value = '';
    this.loading = true;

    const accessToken = sessionStorage.getItem('accesstoken') || '';
    const refreshToken = sessionStorage.getItem('refreshtoken') || '';
    const accountId = sessionStorage.getItem('accountid') || '';

    this.uploadService
      .uploadFiles(files, accessToken, refreshToken, accountId)
      .subscribe({
        next: (res) => {
          this.results = this.markDuplicate(res.details || []);
          this.success = this.results.length;
          this.failed = this.results.filter((r) => r.isDuplicate).length;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          alert('Upload thất bại');
          this.loading = false;
        },
      });
  }

  /** ✅ đánh dấu trùng lặp theo email */
  private markDuplicate(list: UploadResult[]): UploadResult[] {
    const map = new Map<string, UploadResult[]>();

    list.forEach((r) => {
      const email = r.data?.email;
      if (!email) return;
      if (!map.has(email)) map.set(email, []);
      map.get(email)!.push(r);
    });

    map.forEach((arr) => {
      if (arr.length > 1) {
        arr.forEach((r) => {
          r.isDuplicate = true;
          r.duplicateWith = arr
            .filter((x) => x.id !== r.id)
            .map((x) => x.fileName);
        });
      }
    });

    return list;
  }

  /** ✅ danh sách sau filter + search (DÙNG TRONG HTML) */
  get filteredResults(): UploadResult[] {
    return this.results.filter((r) => {
      if (this.filterType === 'DUPLICATE' && !r.isDuplicate) return false;

      if (!this.keyword) return true;

      const kw = this.keyword.toLowerCase();
      return (
        r.fileName.toLowerCase().includes(kw) ||
        r.data?.email?.toLowerCase().includes(kw) ||
        r.data?.fullName?.toLowerCase().includes(kw)
      );
    });
  }
}
