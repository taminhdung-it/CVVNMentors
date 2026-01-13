import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CvService } from '../auth/auth/cv.service';

export interface CV {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cvType: 'Có CV' | 'Không CV';
  status: 'Mới' | 'Duyệt' | 'Không đạt' | 'Lưu trữ';
  job?: string;
  updatedAt: string;
  checked?: boolean;
}

@Component({
  selector: 'app-cv-management',
  templateUrl: './cv-management.component.html',
  styleUrls: ['./cv-management.component.css'],
})
export class CvManagementComponent implements OnInit {
  /* ================= DATA ================= */
  allData: CV[] = [];
  filteredData: CV[] = [];
  pagedData: CV[] = [];

  /* ================= FILTER ================= */
  keyword = '';
  cvType = '';
  status = '';
  date = '';

  /* ================= PAGINATION ================= */
  page = 1;
  pageSize = 10;
  totalPages = 1;

  /* ================= UI STATE ================= */
  openActionId: string | null = null;
  showAddMenu = false;

  /* ================= ASSIGN JOB ================= */
  showAssignModal = false;
  showAssignToast = false;
  assignedCount = 0;
  assignedJob = '';

  jobs = ['Frontend Developer', 'Backend Developer', 'Tester', 'QA Engineer'];
  jobKeyword = '';
  selectedJob: string | null = null;
  showJobDropdown = false;

  constructor(private cvService: CvService, private router: Router) {}

  ngOnInit(): void {
    this.loadCvs();
  }

  /* ================= API ================= */
  loadCvs() {
    this.cvService.getCvs(this.page, this.pageSize).subscribe({
      next: (res: any) => {
        const data = res?.data || [];

        this.allData = data.map(
          (c: any): CV => ({
            id: c.id,
            fullName: c.fullName || 'Unknown',
            email: c.email || '-',
            phone: c.phone || '-',
            cvType: 'Có CV',
            status: this.mapStatus(c.status),
            job: c.position || 'N/A',
            updatedAt: new Date(c.updatedAt).toLocaleDateString('vi-VN'),
            checked: false,
          })
        );

        this.applyFilter();
      },
      error: (err) => console.error('Load CV error', err),
    });
  }

  mapStatus(apiStatus: string): CV['status'] {
    switch (apiStatus) {
      case 'NEW':
        return 'Mới';
      case 'APPROVED':
        return 'Duyệt';
      case 'REJECTED':
        return 'Không đạt';
      case 'ARCHIVED':
        return 'Lưu trữ';
      default:
        return 'Mới';
    }
  }

  mapStatusToApi(status: CV['status']) {
    switch (status) {
      case 'Mới':
        return 'NEW';
      case 'Duyệt':
        return 'APPROVED';
      case 'Không đạt':
        return 'REJECTED';
      case 'Lưu trữ':
        return 'ARCHIVED';
    }
  }

  /* ================= FILTER ================= */
  applyFilter() {
    this.filteredData = this.allData.filter(
      (cv) =>
        (!this.keyword ||
          cv.fullName.toLowerCase().includes(this.keyword.toLowerCase()) ||
          cv.email.toLowerCase().includes(this.keyword.toLowerCase()) ||
          cv.phone.includes(this.keyword)) &&
        (!this.cvType || cv.cvType === this.cvType) &&
        (!this.status || cv.status === this.status)
    );

    this.page = 1;
    this.updatePage();
  }

  clearFilter() {
    this.keyword = '';
    this.cvType = '';
    this.status = '';
    this.date = '';
    this.applyFilter();
  }

  /* ================= PAGINATION ================= */
  updatePage() {
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
    const start = (this.page - 1) * this.pageSize;
    this.pagedData = this.filteredData.slice(start, start + this.pageSize);
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadCvs(); // server-side pagination
  }

  /* ================= CHECKBOX ================= */
  toggleAll(e: any) {
    this.pagedData.forEach((x) => (x.checked = e.target.checked));
  }

  get selectedCVs(): CV[] {
    return this.allData.filter((cv) => cv.checked);
  }

  get selectedCount(): number {
    return this.selectedCVs.length;
  }

  /* ================= ADD CV ================= */
  toggleAddMenu() {
    this.showAddMenu = !this.showAddMenu;
  }

  addCvWithFile() {
    this.showAddMenu = false;
    this.router.navigate(['/cv/import-file']);
  }

  addCvNoFile() {
    alert('Thêm CV không file');
    this.showAddMenu = false;
  }

  importExcel() {
    this.showAddMenu = false;
    this.router.navigate(['/cv/import-excel']);
  }

  /* ================= ASSIGN JOB ================= */
  openAssignModal() {
    this.showAssignModal = true;
    this.showJobDropdown = false;
  }

  closeAssignModal() {
    this.showAssignModal = false;
  }

  filteredJobs() {
    return this.jobs.filter((j) =>
      j.toLowerCase().includes(this.jobKeyword.toLowerCase())
    );
  }

  selectJob(job: string) {
    this.selectedJob = job;
    this.jobKeyword = job;
    this.showJobDropdown = false;
  }

  confirmAssignJob() {
    if (!this.selectedJob) return;

    const selected = this.selectedCVs;

    selected.forEach((cv) => {
      cv.job = this.selectedJob!;
      this.cvService.assignJob(cv.id, this.selectedJob!).subscribe();
    });

    this.assignedCount = selected.length;
    this.assignedJob = this.selectedJob;

    this.showAssignModal = false;
    this.showAssignToast = true;

    setTimeout(() => (this.showAssignToast = false), 3000);

    selected.forEach((cv) => (cv.checked = false));
    this.selectedJob = null;
    this.jobKeyword = '';
  }

  /* ================= ACTION ================= */
  toggleAction(cv: CV) {
    this.openActionId = this.openActionId === cv.id ? null : cv.id;
  }

  setStatus(cv: CV, status: CV['status']) {
    const apiStatusMap: Record<CV['status'], any> = {
      Mới: 'NEW',
      Duyệt: 'APPROVED',
      'Không đạt': 'REJECTED',
      'Lưu trữ': 'ARCHIVED',
    };

    const apiStatus = apiStatusMap[status];

    this.cvService.updateStatus(cv.id, apiStatus).subscribe({
      next: () => {
        // ✅ update UI ngay
        cv.status = status;

        // ✅ reload lại từ server (QUAN TRỌNG)
        this.loadCvs();

        this.openActionId = null;
      },
      error: (err) => {
        console.error('Update status failed', err);
        alert('Cập nhật trạng thái thất bại');
      },
    });
  }

  view(cv: CV) {
    this.router.navigate(['/cv', cv.id]);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Mới':
        return 'status-new';
      case 'Duyệt':
        return 'status-approved';
      case 'Không đạt':
        return 'status-reject';
      case 'Lưu trữ':
        return 'status-archived';
      default:
        return '';
    }
  }

  @HostListener('document:click')
  closeToolbar() {
    this.openActionId = null;
  }
}
