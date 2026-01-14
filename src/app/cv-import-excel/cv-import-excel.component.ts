import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CvImportService } from '../auth/auth/cv-import.service';

interface ImportCV {
  fullName: string;
  email: string;
  phone: string;
  position?: string;
  level?: string;
  experience?: number;
  status: 'Mới' | 'Lỗi' | 'Trùng lặp';
  job?: string;
  updatedAt: string;

  isDuplicateEmail?: boolean;
  isDuplicatePhone?: boolean;
}

interface CVManagement {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  cvType: 'Có CV';
  status: 'Mới';
  job?: string;
  updatedAt: string;
}

@Component({
  selector: 'app-cv-import-excel',
  templateUrl: './cv-import-excel.component.html',
  styleUrls: ['./cv-import-excel.component.css'],
})
export class CvImportExcelComponent {
  /** ===== DATA ===== */
  cvs: ImportCV[] = [];
  filteredCvs: ImportCV[] = [];
  paginatedCvs: ImportCV[] = [];

  /** ===== UI ===== */
  expanded = true;

  /** ===== STATS ===== */
  found = 0;
  duplicated = 0;
  error = 0;

  /** ===== SEARCH ===== */
  keyword = '';

  /** ===== PAGINATION ===== */
  pageSize = 5;
  currentPage = 1;
  totalPages = 1;

  /** ===== SELECTION ===== */
  selectedCvs = new Set<ImportCV>();

  constructor(
    private cvImportService: CvImportService,
    private router: Router
  ) {}

  /* ================= NAV ================= */
  goBack() {
    this.router.navigate(['/cv']);
  }

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  /* ================= READ EXCEL ================= */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;

    const file = input.files[0];

    this.cvImportService.readExcel(file).subscribe((res) => {
      const rows = res.data || [];

      const existedRaw = sessionStorage.getItem('importedCVs');
      const existed: CVManagement[] = existedRaw ? JSON.parse(existedRaw) : [];

      const existedEmails = new Set(existed.map((c) => c.email.toLowerCase()));
      const existedPhones = new Set(existed.map((c) => c.phone));

      const seenEmail = new Map<string, number>();
      const seenPhone = new Map<string, number>();

      this.cvs = rows.map((item: any): ImportCV => {
        const r = item.data || {};
        const email = (r['email'] || '').toLowerCase();
        const phone = r['Số điện thoại'] || '';

        let status: ImportCV['status'] = 'Mới';
        let isDuplicateEmail = false;
        let isDuplicatePhone = false;

        if (!r['Họ và tên'] || !email || !phone) {
          status = 'Lỗi';
        }

        // EMAIL
        if (email) {
          if (seenEmail.has(email)) {
            isDuplicateEmail = true;
            status = 'Trùng lặp';
            seenEmail.set(email, seenEmail.get(email)! + 1);
          } else {
            seenEmail.set(email, 1);
          }
        }

        // PHONE
        if (phone) {
          if (seenPhone.has(phone)) {
            isDuplicatePhone = true;
            status = 'Trùng lặp';
            seenPhone.set(phone, seenPhone.get(phone)! + 1);
          } else {
            seenPhone.set(phone, 1);
          }
        }

        return {
          fullName: r['Họ và tên'] || '',
          email,
          phone,
          position: r['Vị trí'] || '',
          level: r['Cấp độ'] || '',
          experience: Number(r['Kinh nghiệm']) || undefined,
          job: '-',
          updatedAt: new Date().toLocaleDateString('vi-VN'),
          status,
          isDuplicateEmail,
          isDuplicatePhone,
        };
      });

      this.calculateStats();
      this.applyFilter();
    });
  }

  /* ================= FILTER ================= */
  onSearchChange(value: string) {
    this.keyword = value.toLowerCase();
    this.applyFilter();
  }

  applyFilter() {
    this.filteredCvs = this.cvs.filter((c) =>
      c.fullName.toLowerCase().includes(this.keyword)
    );

    this.currentPage = 1;
    this.updatePagination();
  }

  /* ================= PAGINATION ================= */
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredCvs.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedCvs = this.filteredCvs.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  /* ================= SELECTION ================= */
  toggleSelect(cv: ImportCV, checked: boolean) {
    checked ? this.selectedCvs.add(cv) : this.selectedCvs.delete(cv);
  }

  toggleSelectAll(checked: boolean) {
    this.selectedCvs.clear();

    if (checked) {
      this.paginatedCvs
        .filter((cv) => cv.status !== 'Lỗi') // ✅ chỉ chặn Lỗi
        .forEach((cv) => this.selectedCvs.add(cv));
    }
  }

  isSelected(cv: ImportCV) {
    return this.selectedCvs.has(cv);
  }

  /* ================= ACTION ================= */
  addToCvList() {
    const valid = Array.from(this.selectedCvs).filter(
      (c) => c.status !== 'Lỗi'
    );

    if (!valid.length) return;

    const payload = valid.map((cv) => ({
      full_name: cv.fullName,
      email: cv.email,
      phone: cv.phone,
      position: cv.position,
      level: cv.level,
      experience_year: cv.experience,
    }));

    this.cvImportService.importCVs(payload).subscribe({
      next: () => {
        this.router.navigate(['/cv']);
      },
      error: (err) => {
        console.error('Lưu CV thất bại', err);
        alert('Lưu CV thất bại – kiểm tra API backend');
      },
    });
  }

  /* ================= STATS ================= */
  calculateStats() {
    this.found = this.cvs.filter((c) => c.status === 'Mới').length;
    this.duplicated = this.cvs.filter((c) => c.status === 'Trùng lặp').length;
    this.error = this.cvs.filter((c) => c.status === 'Lỗi').length;
  }

  getStatusClass(status: string) {
    if (status === 'Mới') return 'status-new';
    if (status === 'Trùng lặp') return 'status-duplicate';
    return 'status-error';
  }
}
