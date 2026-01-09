import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CvService } from '../cv-detail/cv.service';

export interface CV {
  id: number;
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
  allData: CV[] = [];
  filteredData: CV[] = [];
  pagedData: CV[] = [];

  keyword = '';
  cvType = '';
  status = '';
  date = '';

  page = 1;
  pageSize = 5;

  /** ===== ACTION TOOLBAR ===== */
  openActionId: number | null = null;

  /** ===== ADD CV MENU ===== */
  showAddMenu = false;

  /** ===== ASSIGN JOB ===== */
  showAssignModal = false;

  showAssignToast = false;
  assignedCount = 0;
  assignedJob = '';

  jobs = [
    'Frontend Developer',
    'Backend Developer',
    'Tester',
    'QA Engineer',
    'DevOps',
  ];

  jobKeyword = '';
  selectedJob: string | null = null;
  showJobDropdown = false;

  constructor(
    private cvService: CvService,
    private router: Router
  ) {}

  ngOnInit(): void {
  this.allData = this.mockData();

  // 🔥 LƯU CV VÀO SERVICE
  this.cvService.setCVs(this.allData);

  this.applyFilter();
}


  mockData(): CV[] {
    return [
      {
        id: 1,
        fullName: 'Dũng Họ Cao',
        email: 'nguyenvana@gmail.com',
        phone: '0966381048',
        cvType: 'Có CV',
        status: 'Mới',
        job: 'Senior Frontend Developer',
        updatedAt: '07/01/2026',
      },
      {
        id: 2,
        fullName: 'Đào Quốc Sơn Hà',
        email: 'nguyenvana@gmail.com',
        phone: '0966381048',
        cvType: 'Có CV',
        status: 'Duyệt',
        job: 'Senior Backend Developer',
        updatedAt: '07/01/2026',
      },
      {
        id: 3,
        fullName: 'Nguyễn Minh Dương',
        email: 'nguyenvana@gmail.com',
        phone: '0966381048',
        cvType: 'Có CV',
        status: 'Mới',
        job: 'Senior Frontend Developer',
        updatedAt: '07/01/2026',
      },
    ];
  }

  /* ================= FILTER ================= */
  applyFilter() {
    this.filteredData = this.allData.filter(cv =>
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

  updatePage() {
    const start = (this.page - 1) * this.pageSize;
    this.pagedData = this.filteredData.slice(start, start + this.pageSize);
  }

  toggleAll(e: any) {
    this.pagedData.forEach(x => (x.checked = e.target.checked));
  }

  get selectedCVs() {
    return this.allData.filter(cv => cv.checked);
  }

  get selectedCount(): number {
    return this.selectedCVs.length;
  }

  /* ================= ADD CV ================= */
  toggleAddMenu() {
    this.showAddMenu = !this.showAddMenu;
  }

  addCvWithFile() {
    alert('Thêm CV bằng file');
    this.showAddMenu = false;
  }

  importExcel() {
    alert('Import Excel');
    this.showAddMenu = false;
  }

  addCvNoFile() {
    alert('Thêm CV không có file');
    this.showAddMenu = false;
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
    return this.jobs.filter(j =>
      j.toLowerCase().includes(this.jobKeyword.toLowerCase())
    );
  }

  selectJob(job: string) {
    this.selectedJob = job;
    this.jobKeyword = job;
    this.showJobDropdown = false;
  }

  /** ✅ HÀM DUY NHẤT GÁN JOB + HIỆN TOAST */
  confirmAssignJob() {
    if (!this.selectedJob) {
      alert('Vui lòng chọn job');
      return;
    }

    const selected = this.selectedCVs;

    selected.forEach(cv => (cv.job = this.selectedJob!));

    this.assignedCount = selected.length;
    this.assignedJob = this.selectedJob;

    // đóng modal
    this.showAssignModal = false;

    // hiện toast
    this.showAssignToast = true;

    // auto ẩn
    setTimeout(() => {
      this.showAssignToast = false;
    }, 3000);

    // clear checkbox
    selected.forEach(cv => (cv.checked = false));

    // reset job
    this.selectedJob = null;
    this.jobKeyword = '';
  }

  /* ================= ACTION TOOLBAR ================= */
  toggleAction(cv: CV) {
    this.openActionId = this.openActionId === cv.id ? null : cv.id;
  }

  setStatus(cv: CV, status: CV['status']) {
    cv.status = status;
    this.openActionId = null;
  }

  @HostListener('document:click')
  closeToolbar() {
    this.openActionId = null;
  }


view(cv: CV) {
  this.router.navigate(['/cv', cv.id]);
}

  getStatusClass(status: string): string {
    switch (status) {
      case 'Mới': return 'status-new';
      case 'Duyệt': return 'status-approved';
      case 'Không đạt': return 'status-reject';
      case 'Lưu trữ': return 'status-archived';
      default: return '';
    }
  }

  // ===== MENU ACTION (ICON HÌNH NGƯỜI) =====
openUserMenuId: number | null = null;

toggleUserMenu(cv: CV) {
  this.openUserMenuId = this.openUserMenuId === cv.id ? null : cv.id;
}

goDetail(cv: CV) {
  alert('Xem chi tiết: ' + cv.fullName);
  this.openUserMenuId = null;
}

assignJobFromRow(cv: CV) {
  cv.checked = true;
  this.openAssignModal();
  this.openUserMenuId = null;
}

viewHistory(cv: CV) {
  alert('Xem lịch sử: ' + cv.fullName);
  this.openUserMenuId = null;
}

/** click ra ngoài thì đóng menu */
@HostListener('document:click')
closeUserMenu() {
  this.openUserMenuId = null;
}

}
