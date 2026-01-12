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

  /* ================= READ EXCEL ================= */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.cvImportService.readExcel(file).subscribe((res) => {
      const rows = res.data || [];

      const existedRaw = sessionStorage.getItem('importedCVs');
      const existed: CVManagement[] = existedRaw ? JSON.parse(existedRaw) : [];

      const existedEmails = new Set(existed.map((c) => c.email.toLowerCase()));
      const existedPhones = new Set(existed.map((c) => c.phone));

      const seenEmail = new Set<string>();
      const seenPhone = new Set<string>();

      this.cvs = rows.map((item: any): ImportCV => {
        const r = item.data || {};
        const email = (r['email'] || '').toLowerCase();
        const phone = r['Số điện thoại'] || '';

        let status: ImportCV['status'] = 'Mới';

        if (!r['Họ và tên'] || !email || !phone) {
          status = 'Lỗi';
        } else if (
          existedEmails.has(email) ||
          existedPhones.has(phone) ||
          seenEmail.has(email) ||
          seenPhone.has(phone)
        ) {
          status = 'Trùng lặp';
        }

        seenEmail.add(email);
        seenPhone.add(phone);

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
        .filter((c) => c.status === 'Mới')
        .forEach((c) => this.selectedCvs.add(c));
    }
  }

  isSelected(cv: ImportCV) {
    return this.selectedCvs.has(cv);
  }

  /* ================= ACTION ================= */
  addToCvList() {
    const valid = Array.from(this.selectedCvs).filter(
      (c) => c.status === 'Mới'
    );
    if (!valid.length) return;

    const storedRaw = sessionStorage.getItem('importedCVs');
    const stored: CVManagement[] = storedRaw ? JSON.parse(storedRaw) : [];

    const newCVs: CVManagement[] = valid.map((cv, i) => ({
      id: Date.now() + i,
      fullName: cv.fullName,
      email: cv.email,
      phone: cv.phone,
      cvType: 'Có CV',
      status: 'Mới',
      job: cv.position || '-',
      updatedAt: cv.updatedAt,
    }));

    sessionStorage.setItem(
      'importedCVs',
      JSON.stringify([...stored, ...newCVs])
    );

    this.router.navigate(['/cv']);
  }

  goBack() {
    this.router.navigate(['/cv']);
  }

  toggleExpand() {
    this.expanded = !this.expanded;
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
