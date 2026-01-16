import { Component, OnInit } from '@angular/core';
import { JobService } from '../auth/auth/job.service';
import type { ApplicationDetail, JobApi } from '../models/job.model';

export type ApplicationStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFERED'
  | 'HIRED'
  | 'REJECTED';

interface Candidate {
  // ===== APPLICATION =====
  id: string;
  status: ApplicationStatus;

  appliedAt: string;
  updatedAt: string;

  interviewScheduled: string | null;
  rating: number | null;
  feedback: string | null;
  rejectionReason: string | null;

  // ===== CV =====
  cvId: string;
  name: string; // cv.fullName
  email: string | null;
  phone: string | null;
  cvFileUrl: string;
  position: string | null;
  experienceYears: number | null;
}

interface Job {
  id: number; // UI id
  jobApiId: string; // backend id

  title: string;
  department: string;
  createdDate: string;

  status: 'Mở' | 'Đóng' | 'Khóa';
  description: string;

  recruitmentCount?: number; // headcountTarget
  hiredCount?: number; // headcountHired

  requirements?: string; // skills
  applyStart?: string;
  applyEnd?: string;

  createdBy?: string;

  closedAt?: string | null; // ✅ BẮT BUỘC (HTML đang dùng)
  closedReason?: string | null;

  jdFileUrl?: string | null;

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
  // ===== APPLICATION DETAIL MODE =====
  applicationMode: 'view' | 'edit' = 'view';

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

  // ===== APPLICATION DETAIL =====
  selectedApplication?: ApplicationDetail;
  showApplicationDetail = false;
  showStatusMenu = false;
  openCandidateActionId: string | null = null;

  // ===== PAGINATION =====
  currentPage = 1;
  pageSize = 10;

  // ===== PAGINATION: JOB LIST =====
  jobPage = 1;
  jobPageSize = 10;
  jobTotalPages = 1;

  // ===== DATA: JOBS =====
  jobs: Job[] = [];

  // ===== DATA: CANDIDATES =====
  candidates: Candidate[] = [];

  // ===== EDIT APPLICATION FORM =====
  editForm = {
    interviewScheduled: null as string | null,
    rating: null as number | null,
    feedback: null as string | null,
    rejectionReason: null as string | null,
  };

  isSavingApplication = false;

  constructor(private jobService: JobService) {}

  // ===== INIT =====
  ngOnInit(): void {
    this.loadJobs();
  }

  toggleStatusMenu() {
    this.showStatusMenu = !this.showStatusMenu;
  }

  toggleCandidateStatusMenu(applicationId: string) {
    this.openCandidateActionId =
      this.openCandidateActionId === applicationId ? null : applicationId;
  }

  getAllowedNextStatuses(current: ApplicationStatus): ApplicationStatus[] {
    const workflow: Record<ApplicationStatus, ApplicationStatus[]> = {
      APPLIED: ['SCREENING', 'REJECTED'],
      SCREENING: ['INTERVIEW', 'REJECTED'],
      INTERVIEW: ['OFFERED', 'REJECTED'],
      OFFERED: ['HIRED', 'REJECTED'],
      HIRED: [],
      REJECTED: [],
    };

    return workflow[current] || [];
  }

  getStatusIcon(status: ApplicationStatus): string {
    const map: Record<ApplicationStatus, string> = {
      APPLIED: 'inbox',
      SCREENING: 'manage_search',
      INTERVIEW: 'forum',
      OFFERED: 'handshake',
      HIRED: 'check_circle',
      REJECTED: 'block',
    };
    return map[status];
  }

  getStatusLabel(status: ApplicationStatus): string {
    const map: Record<ApplicationStatus, string> = {
      APPLIED: 'Đã nộp',
      SCREENING: 'Sàng lọc',
      INTERVIEW: 'Phỏng vấn',
      OFFERED: 'Mời nhận việc',
      HIRED: 'Đã tuyển',
      REJECTED: 'Từ chối',
    };
    return map[status];
  }

  changeCandidateStatus(candidate: Candidate, status: ApplicationStatus) {
    let rejectionReason: string | undefined;

    if (status === 'REJECTED') {
      const reason = prompt('Nhập lý do từ chối');
      if (!reason) return;
      rejectionReason = reason;
    }

    this.jobService
      .updateApplicationStatus(candidate.id, {
        status,
        rejectionReason,
      })
      .subscribe({
        next: () => {
          candidate.status = status;
          candidate.rejectionReason = rejectionReason ?? null;
          this.openCandidateActionId = null;
        },
        error: (err) => {
          alert(err?.error?.message || 'Cập nhật trạng thái thất bại');
        },
      });
  }

  canChangeStatus(
    current: ApplicationStatus,
    next: ApplicationStatus
  ): boolean {
    const workflow: Record<ApplicationStatus, ApplicationStatus[]> = {
      APPLIED: ['SCREENING', 'REJECTED'],
      SCREENING: ['INTERVIEW', 'REJECTED'],
      INTERVIEW: ['OFFERED', 'REJECTED'],
      OFFERED: ['HIRED', 'REJECTED'],
      HIRED: [],
      REJECTED: [],
    };

    return workflow[current]?.includes(next) ?? false;
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

  viewApplicationDetail(applicationId: string) {
    this.applicationMode = 'view'; // 👈 QUAN TRỌNG

    this.jobService.getApplicationDetail(applicationId).subscribe({
      next: (res) => {
        this.selectedApplication = {
          id: res.id,
          status: res.status,
          interviewScheduled: res.interviewScheduled,
          feedback: res.feedback,
          rating: res.rating,
          rejectionReason: res.rejectionReason,
          appliedAt: this.formatDate(res.appliedAt),
          updatedAt: this.formatDate(res.updatedAt),
          job: {
            id: res.job.id,
            name: res.job.name,
            status: res.job.status,
            departmentId: res.job.departmentId,
            departmentName: this.getDepartmentName(res.job.departmentId),
            headcountTarget: res.job.headcountTarget,
            applyEnd: this.formatDate(res.job.applyEnd),
          },
        };

        this.showApplicationDetail = true;
      },
      error: (err) => {
        console.error('Load application detail failed', err);
        alert('Không tải được chi tiết hồ sơ');
      },
    });
  }

  /* Chuyển sang chế độ chỉnh sửa hồ sơ ứng tuyển */
  enterEditApplication() {
    if (!this.selectedApplication) return;

    this.applicationMode = 'edit';

    // clone dữ liệu sang form edit
    this.editForm = {
      interviewScheduled: this.selectedApplication.interviewScheduled,
      rating: this.selectedApplication.rating,
      feedback: this.selectedApplication.feedback,
      rejectionReason: this.selectedApplication.rejectionReason,
    };
  }

  /* Lưu thay đổi hồ sơ ứng tuyển */
  saveApplicationDetail() {
    if (!this.selectedApplication) return;

    this.isSavingApplication = true;

    const payload: any = {};

    if (this.editForm.interviewScheduled)
      payload.interviewScheduled = this.editForm.interviewScheduled;

    if (this.editForm.rating !== null) payload.rating = this.editForm.rating;

    if (this.editForm.feedback) payload.feedback = this.editForm.feedback;

    if (this.editForm.rejectionReason)
      payload.rejectionReason = this.editForm.rejectionReason;

    this.jobService
      .updateApplication(this.selectedApplication.id, payload)
      .subscribe({
        next: () => {
          // ✅ cập nhật UI
          Object.assign(this.selectedApplication!, payload);
          this.applicationMode = 'view';

          alert('Cập nhật hồ sơ thành công');
          this.isSavingApplication = false;
        },
        error: (err) => {
          console.error('UPDATE APPLICATION FAILED', err);
          alert('Cập nhật hồ sơ thất bại');
          this.isSavingApplication = false;
        },
      });
  }

  updateApplicationStatus(status: ApplicationStatus) {
    if (!this.selectedApplication) return;

    // ❗ Validate workflow
    const current = this.selectedApplication.status;

    const allowed: Record<ApplicationStatus, ApplicationStatus[]> = {
      APPLIED: ['SCREENING', 'REJECTED'],
      SCREENING: ['INTERVIEW', 'REJECTED'],
      INTERVIEW: ['OFFERED', 'REJECTED'],
      OFFERED: ['HIRED', 'REJECTED'],
      HIRED: [],
      REJECTED: [],
    };

    if (!allowed[current]?.includes(status)) {
      alert(`Không thể chuyển từ ${current} → ${status}`);
      return;
    }

    // ❗ Validate reject reason
    if (status === 'REJECTED' && !this.editForm.rejectionReason) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    const payload: { status: ApplicationStatus; rejectionReason?: string } = {
      status,
    };

    if (status === 'REJECTED') {
      if (!this.editForm.rejectionReason) {
        alert('Vui lòng nhập lý do từ chối');
        return;
      }

      payload.rejectionReason = this.editForm.rejectionReason;
    }

    console.log('UPDATE STATUS PAYLOAD', payload);

    this.jobService
      .updateApplicationStatus(this.selectedApplication.id, payload)
      .subscribe({
        next: (res: any) => {
          console.log('UPDATE STATUS SUCCESS', res);

          this.selectedApplication!.status = status;
          this.showStatusMenu = false;

          alert('Cập nhật trạng thái thành công');
        },
        error: (err) => {
          console.error('UPDATE STATUS FAILED', err);
          alert(err?.error?.message || 'Cập nhật trạng thái thất bại');
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

  getDepartmentName(departmentId: string): string {
    const map: Record<string, string> = {
      '5JC7QkMSzsUaCev8SIi5': 'Backend',
      ABC123: 'Frontend',
    };
    return map[departmentId] || '—';
  }

  /* Kiểm tra file CV hợp lệ */
  isValidCvFile(url: string | null | undefined): boolean {
    if (!url) return false;

    return /\.(pdf|doc|docx)$/i.test(url);
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
      id: Math.random(),
      jobApiId: job.id,

      title: job.name,
      department: job.departmentId,
      createdDate: this.formatDate(job.createdAt),

      status,
      description: job.description,

      recruitmentCount: job.headcountTarget,
      hiredCount: job.headcountHired,

      requirements: Array.isArray(job.skills)
        ? job.skills.join(', ')
        : job.skills,

      applyStart: job.applyStart ? this.formatDate(job.applyStart) : undefined,

      applyEnd: job.applyEnd ? this.formatDate(job.applyEnd) : undefined,

      closedAt: job.closedAt ? this.formatDate(job.closedAt) : null,

      closedReason: job.closedReason ?? null,

      jdFileUrl: job.jdFileUrl ?? null,

      createdBy: job.createdBy,
    };
  }

  private callUpdateStatus(
    candidate: Candidate,
    status: ApplicationStatus,
    rejectionReason?: string
  ) {
    const payload: any = { status };

    if (status === 'REJECTED') {
      payload.rejectionReason = rejectionReason;
    }

    this.jobService.updateApplicationStatus(candidate.id, payload).subscribe({
      next: () => {
        candidate.status = status;
        if (rejectionReason) {
          candidate.rejectionReason = rejectionReason;
        }

        this.openCandidateActionId = null;
        alert('Cập nhật trạng thái thành công');
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message || 'Cập nhật trạng thái thất bại');
      },
    });
  }

  private formatDate(date: string): string {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}-${String(
      d.getMonth() + 1
    ).padStart(2, '0')}-${d.getFullYear()}`;
  }

  // ===== COMPUTED: GET CANDIDATE COUNT =====
  getCandidateCount(): number {
    return this.candidates.length;
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
    return this.candidates.filter((c) => {
      const search = this.candidateSearchText.toLowerCase();

      const matchSearch =
        c.name.toLowerCase().includes(search) ||
        (c.email ?? '').toLowerCase().includes(search);

      const matchStatus =
        !this.candidateStatusFilter || c.status === this.candidateStatusFilter;

      return matchSearch && matchStatus;
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
    this.currentView = 'job-detail';
    this.activeDetailTab = 'candidates';
    this.selectedJob = undefined;
    this.candidates = [];

    // 1️⃣ Load job detail
    this.jobService.getJobDetail(job.jobApiId).subscribe({
      next: (apiJob) => {
        this.selectedJob = this.mapJobApiToJob(apiJob);

        // 2️⃣ Load candidates theo job
        this.loadCandidatesByJob(job.jobApiId);
      },
      error: () => {
        alert('Không tải được chi tiết job');
        this.currentView = 'job-list';
      },
    });
  }

  loadCandidatesByJob(jobApiId: string) {
    this.jobService
      .getApplicationsByJob(
        jobApiId,
        this.candidateStatusFilter || undefined,
        this.currentPage,
        this.pageSize
      )

      .subscribe({
        next: (res) => {
          this.candidates = res.data.map(
            (item: any): Candidate => ({
              // ===== APPLICATION =====
              id: item.id,
              status: item.status,

              appliedAt: this.formatDate(item.appliedAt),
              updatedAt: this.formatDate(item.updatedAt),

              interviewScheduled: item.interviewScheduled,
              rating: item.rating,
              feedback: item.feedback,
              rejectionReason: item.rejectionReason,

              cvId: item.cv?.cvId,

              name: item.cv?.email ? item.cv.email.split('@')[0] : 'Unknown',

              email: item.cv?.email,
              phone: item.cv?.phone,
              cvFileUrl: item.cv?.cvFileUrl,
              position: item.cv?.position,
              experienceYears: item.cv?.experienceYears,
            })
          );
        },

        error: (err) => {
          console.error('Load candidates failed', err);

          this.candidates = [];
        },
      });
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

  handleToggleJobStatusDetail() {
    if (!this.selectedJob) {
      console.error('selectedJob is null');
      return;
    }

    const jobApiId = this.selectedJob.jobApiId;
    const currentStatus = this.selectedJob.status;

    console.log('TOGGLE JOB STATUS', {
      jobApiId,
      currentStatus,
    });

    // ================= ĐANG MỞ → ĐÓNG =================
    if (currentStatus === 'Mở') {
      const reason = 'Đóng job từ trang chi tiết';

      this.jobService.closeJob(jobApiId, reason).subscribe({
        next: () => {
          console.log('API CLOSE JOB SUCCESS');
          this.selectedJob!.status = 'Đóng';

          // sync lại list job
          const jobInList = this.jobs.find((j) => j.jobApiId === jobApiId);
          if (jobInList) jobInList.status = 'Đóng';
        },
        error: (err) => {
          console.error('API CLOSE JOB FAILED', err);
          alert('Đóng job thất bại');
        },
      });

      return;
    }

    // ================= ĐANG ĐÓNG → MỞ =================
    if (currentStatus === 'Đóng') {
      this.jobService.openJob(jobApiId).subscribe({
        next: () => {
          console.log('API OPEN JOB SUCCESS');
          this.selectedJob!.status = 'Mở';

          const jobInList = this.jobs.find((j) => j.jobApiId === jobApiId);
          if (jobInList) jobInList.status = 'Mở';
        },
        error: (err) => {
          console.error('API OPEN JOB FAILED', err);
          alert('Mở job thất bại');
        },
      });

      return;
    }

    console.warn('JOB IS LOCKED – NO ACTION');
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
