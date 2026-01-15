import { Component, OnInit } from '@angular/core';
import { JobService } from '../auth/auth/job.service';
import type { JobApi } from '../models/job.model';

interface Candidate {
  id: number;
  jobId: number;
  name: string;
  email: string;
  phone: string;
  cvType: string;
  status: 'Mới' | 'Duyệt';
  createdDate: string;
}

interface Job {
  id: number; // UI ID
  jobApiId: string; // ⬅️ backend ID (rất quan trọng)
  title: string;
  department: string;
  createdDate: string;
  status: 'Mở' | 'Đóng' | 'Khóa';
  description: string;
  recruitmentCount?: number;
  requirements?: string;
  showMenu?: boolean;
}

@Component({
  selector: 'app-job-management',
  templateUrl: './job-management.component.html',
  styleUrls: ['./job-management.component.css'],
})
export class JobManagementComponent implements OnInit {
  // ===== VIEW STATE =====
  currentView: 'job-list' | 'job-detail' = 'job-list';
  activeDetailTab: 'candidates' | 'info' = 'candidates';
  selectedJob?: Job;

  // ===== MODAL STATE =====
  showAddJobModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editingJobId: number | null = null;
  openActionId: number | null = null;
  newJob: Job = {
    id: 0,
    jobApiId: '', // ✅ THÊM DÒNG NÀY
    title: '',
    department: '',
    createdDate: '',
    status: 'Mở',
    description: '',
    recruitmentCount: 0,
    requirements: '',
  };

  // ===== FILTERS - JOB LIST =====
  jobSearchText = '';
  jobTitleFilter = '';
  jobStatusFilter = '';
  dateFilter = '';

  // ===== FILTERS - CANDIDATE LIST =====
  candidateSearchText = '';
  candidateStatusFilter = '';

  // ===== PAGINATION =====
  currentPage = 1;
  pageSize = 10;

  // ===== PAGINATION: JOB LIST =====
  jobPage = 1;
  jobPageSize = 10;
  jobTotalPages = 1;

  // ===== DATA: JOBS =====
  jobs: Job[] = []; // ⬅️ GIỮ BIẾN – DATA SẼ ĐƯỢC ĐỔ TỪ API

  // ===== DATA: CANDIDATES =====
  candidates: Candidate[] = [
    {
      id: 1,
      jobId: 1,
      name: 'Đồng Hồ Cao',
      email: 'nguyenvana@gmail.com',
      phone: '0966381048',
      cvType: 'Có CV',
      status: 'Mới',
      createdDate: '07-01-2026',
    },
  ];

  constructor(private jobService: JobService) {}

  // ===== INIT =====
  ngOnInit(): void {
    this.loadJobs();
  }

  // ===== API: LOAD JOBS =====
  loadJobs() {
    this.jobService.getJobs(this.jobPage, this.jobPageSize).subscribe({
      next: (res) => {
        this.jobs = res.data.map((job) => this.mapJobApiToJob(job));

        this.jobTotalPages =
          res.meta?.total && res.meta?.limit
            ? Math.ceil(res.meta.total / res.meta.limit)
            : 1;
      },
      error: (err) => {
        console.error('Load jobs error', err);
      },
    });
  }

  /*Đóng trạng thái*/
  closeJob(job: Job) {
    // Chỉ cho đóng khi đang Mở
    if (job.status !== 'Mở') return;

    const reason = 'Đóng job từ giao diện quản lý'; // sau này có thể mở modal nhập

    this.jobService.closeJob(job.jobApiId, reason).subscribe({
      next: () => {
        // ✅ Update UI ngay, không reload trang
        job.status = 'Đóng';

        if (this.selectedJob?.jobApiId === job.jobApiId) {
          this.selectedJob.status = 'Đóng';
        }

        this.openActionId = null;
      },
      error: (err) => {
        console.error('Close job failed', err);
        alert('Đóng job thất bại');
      },
    });
  }

  /*Mở trạng thái*/
  openJob(job: Job) {
    if (job.status === 'Mở') return;

    this.jobService.openJob(job.jobApiId).subscribe({
      next: () => {
        job.status = 'Mở';

        if (this.selectedJob?.jobApiId === job.jobApiId) {
          this.selectedJob.status = 'Mở';
        }

        this.openActionId = null;
      },
      error: () => alert('Mở lại job thất bại'),
    });
  }

  /* Khoá trạng thái */
  lockJob(job: Job) {
    // Khoá khi đang Mở hoặc Đóng
    if (job.status === 'Khóa') return;

    this.jobService.lockJob(job.jobApiId).subscribe({
      next: () => {
        job.status = 'Khóa'; // ⬅️ LOCKED

        if (this.selectedJob?.jobApiId === job.jobApiId) {
          this.selectedJob.status = 'Khóa';
        }

        this.openActionId = null;
      },
      error: () => alert('Khoá job thất bại'),
    });
  }

  // ===== MAP API → UI =====
  private mapJobApiToJob(job: JobApi): Job {
    let status: 'Mở' | 'Đóng' | 'Khóa' = 'Mở';

    if (job.status === 'OPEN') status = 'Mở';
    else if (job.status === 'CLOSED') status = 'Đóng';
    else if (job.status === 'LOCKED') status = 'Khóa';

    return {
      id: Math.random(), // UI only
      jobApiId: job.id, // ⬅️ backend id
      title: job.name,
      department: job.departmentId,
      createdDate: this.formatDate(job.createdAt),
      status,
      description: job.description,
      recruitmentCount: job.headcountTarget,
      requirements: Array.isArray(job.skills)
        ? job.skills.join(', ')
        : job.skills,
    };
  }

  private formatDate(date: string): string {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}-${String(
      d.getMonth() + 1
    ).padStart(2, '0')}-${d.getFullYear()}`;
  }

  // ===== COMPUTED: GET CANDIDATE COUNT =====
  getCandidateCount(jobId: number): number {
    return this.candidates.filter((c) => c.jobId === jobId).length;
  }

  // ===== COMPUTED: FILTERED JOBS =====
  get filteredJobs(): Job[] {
    return this.jobs.filter((job) => {
      const matchSearch =
        job.title.toLowerCase().includes(this.jobSearchText.toLowerCase()) ||
        job.department.toLowerCase().includes(this.jobSearchText.toLowerCase());
      const matchTitle =
        !this.jobTitleFilter || job.title === this.jobTitleFilter;
      const matchStatus =
        !this.jobStatusFilter || job.status === this.jobStatusFilter;
      const matchDate =
        !this.dateFilter || job.createdDate.includes(this.dateFilter);

      return matchSearch && matchTitle && matchStatus && matchDate;
    });
  }

  // ===== COMPUTED: FILTERED CANDIDATES =====
  get filteredCandidates(): Candidate[] {
    if (!this.selectedJob) return [];

    return this.candidates.filter((c) => {
      const matchJob = c.jobId === this.selectedJob!.id;
      const matchSearch =
        c.name.toLowerCase().includes(this.candidateSearchText.toLowerCase()) ||
        c.email.toLowerCase().includes(this.candidateSearchText.toLowerCase());
      const matchStatus =
        !this.candidateStatusFilter || c.status === this.candidateStatusFilter;

      return matchJob && matchSearch && matchStatus;
    });
  }

  // ===== COMPUTED: PAGINATION =====
  get totalPages(): number {
    return Math.ceil(this.filteredCandidates.length / this.pageSize);
  }

  get paginatedCandidates(): Candidate[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCandidates.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // ===== COMPUTED: IS JOB CLOSED =====
  get isJobClosed(): boolean {
    return this.selectedJob?.status === 'Đóng';
  }

  // ===== HANDLERS: VIEW =====
  handleViewJobDetail(job: Job) {
    this.selectedJob = job;
    this.currentView = 'job-detail';
    this.activeDetailTab = 'candidates';
    this.currentPage = 1;
    this.candidateSearchText = '';
    this.candidateStatusFilter = '';
  }

  handleBackToList() {
    this.currentView = 'job-list';
    this.selectedJob = undefined;
    this.candidateSearchText = '';
    this.candidateStatusFilter = '';
    this.activeDetailTab = 'candidates';
    this.currentPage = 1;
  }

  setActiveTab(tab: 'candidates' | 'info') {
    this.activeDetailTab = tab;
  }

  // ===== HANDLERS: JOB STATUS =====
  handleToggleJobStatus(jobId: number) {
    this.jobs = this.jobs.map((job) => {
      if (job.id !== jobId) return job;

      if (job.status === 'Mở') {
        return { ...job, status: 'Đóng' };
      }

      if (job.status === 'Đóng') {
        return { ...job, status: 'Khóa' };
      }

      // ⛔ Khóa thì không cho đổi
      return job;
    });

    if (this.selectedJob && this.selectedJob.id === jobId) {
      if (this.selectedJob.status === 'Mở') {
        this.selectedJob = { ...this.selectedJob, status: 'Đóng' };
      } else if (this.selectedJob.status === 'Đóng') {
        this.selectedJob = { ...this.selectedJob, status: 'Khóa' };
      }
    }
  }

  changeJobStatus(job: Job, status: 'Mở' | 'Đóng' | 'Khóa') {
    if (job.status === 'Khóa') return;

    job.status = status;
    this.openActionId = null;

    if (this.selectedJob?.id === job.id) {
      this.selectedJob.status = status;
    }
  }

  get isJobLocked(): boolean {
    return this.selectedJob?.status === 'Khóa';
  }

  toggleAction(jobId: number) {
    this.openActionId = this.openActionId === jobId ? null : jobId;
  }

  // ===== HANDLERS: MODAL =====
  handleOpenAddModal() {
    this.modalMode = 'add';
    this.editingJobId = null;
    this.showAddJobModal = true;
  }

  handleOpenEditModal(job: Job) {
    this.modalMode = 'edit';
    this.editingJobId = job.id;
    this.newJob = { ...job };
    this.showAddJobModal = true;
  }

  handleCloseModal() {
    this.showAddJobModal = false;
  }

  handleSaveJob() {
    this.showAddJobModal = false;
  }

  // ===== HANDLERS: FILTERS =====
  handleClearFilters() {
    this.jobSearchText = '';
    this.jobTitleFilter = '';
    this.jobStatusFilter = '';
    this.dateFilter = '';
  }

  // ===== HANDLERS: PAGINATION =====
  goToJobPage(page: number) {
    if (page < 1 || page > this.jobTotalPages) return;
    this.jobPage = page;
    this.loadJobs();
  }

  previousJobPage() {
    if (this.jobPage > 1) {
      this.goToJobPage(this.jobPage - 1);
    }
  }

  nextJobPage() {
    if (this.jobPage < this.jobTotalPages) {
      this.goToJobPage(this.jobPage + 1);
    }
  }

  get jobPageNumbers(): number[] {
    return Array.from({ length: this.jobTotalPages }, (_, i) => i + 1);
  }
}
