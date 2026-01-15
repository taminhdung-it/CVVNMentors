import { Component } from '@angular/core';

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
  id: number;
  title: string;
  department: string;
  createdDate: string;
  status: 'Mở' | 'Đóng';
  description: string;
  recruitmentCount?: number;
  requirements?: string;
}

@Component({
  selector: 'app-job-management',
  templateUrl: './job-management.component.html',
  styleUrls: ['./job-management.component.css'],
})
export class JobManagementComponent {
  // ===== VIEW STATE =====
  currentView: 'job-list' | 'job-detail' = 'job-list';
  activeDetailTab: 'candidates' | 'info' = 'candidates';
  selectedJob?: Job;

  // ===== MODAL STATE =====
  showAddJobModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editingJobId: number | null = null;
  newJob: Job = {
    id: 0,
    title: '',
    department: '',
    createdDate: '',
    status: 'Mở',
    description: '',
    recruitmentCount: 0,
    requirements: ''
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

  // ===== DATA: JOBS =====
  jobs: Job[] = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      department: 'Phòng IT',
      createdDate: '07-01-2026',
      status: 'Mở',
      description: 'Tìm kiếm Frontend Developer có kinh nghiệm với React, Angular hoặc Vue.js. Yêu cầu có ít nhất 3 năm kinh nghiệm làm việc với các framework hiện đại.',
      recruitmentCount: 2,
      requirements: 'React, Angular, 3+ years experience'
    },
    {
      id: 2,
      title: 'Senior Backend Developer',
      department: 'Phòng IT',
      createdDate: '07-01-2026',
      status: 'Mở',
      description: 'Tìm kiếm Backend Developer có kinh nghiệm với Node.js, Python hoặc Java. Có kinh nghiệm làm việc với database và API design.',
      recruitmentCount: 3,
      requirements: 'Node.js, Python or Java, Database, API design'
    },
    {
      id: 3,
      title: 'Tester',
      department: 'Phòng QA',
      createdDate: '05-01-2026',
      status: 'Đóng',
      description: 'Tìm kiếm QA Tester có kinh nghiệm test automation với Selenium, Cypress hoặc các công cụ tương tự.',
      recruitmentCount: 1,
      requirements: 'Selenium, Cypress, Test automation'
    }
  ];

  // ===== DATA: CANDIDATES =====
  candidates: Candidate[] = [
    { id: 1, jobId: 1, name: 'Đồng Hồ Cao', email: 'nguyenvana@gmail.com', phone: '0966381048', cvType: 'Có CV', status: 'Mới', createdDate: '07-01-2026' },
    { id: 2, jobId: 1, name: 'Đào Quốc Sơn Hà', email: 'nguyenvana@gmail.com', phone: '0966381048', cvType: 'Có CV', status: 'Duyệt', createdDate: '07-01-2026' },
    { id: 3, jobId: 1, name: 'Nguyễn Minh Dương', email: 'nguyenvana@gmail.com', phone: '0966381048', cvType: 'Có CV', status: 'Mới', createdDate: '07-01-2026' },
    { id: 4, jobId: 2, name: 'Trần Văn B', email: 'tranvanb@gmail.com', phone: '0966381049', cvType: 'Có CV', status: 'Mới', createdDate: '07-01-2026' },
    { id: 5, jobId: 2, name: 'Lê Thị C', email: 'lethic@gmail.com', phone: '0966381050', cvType: 'Có CV', status: 'Duyệt', createdDate: '07-01-2026' }
  ];

  // ===== COMPUTED: GET CANDIDATE COUNT =====
  getCandidateCount(jobId: number): number {
    return this.candidates.filter(c => c.jobId === jobId).length;
  }

  // ===== COMPUTED: FILTERED JOBS =====
  get filteredJobs(): Job[] {
    return this.jobs.filter(job => {
      const matchSearch = job.title.toLowerCase().includes(this.jobSearchText.toLowerCase()) ||
                         job.department.toLowerCase().includes(this.jobSearchText.toLowerCase());
      const matchTitle = !this.jobTitleFilter || job.title === this.jobTitleFilter;
      const matchStatus = !this.jobStatusFilter || job.status === this.jobStatusFilter;
      const matchDate = !this.dateFilter || job.createdDate.includes(this.dateFilter);
      
      return matchSearch && matchTitle && matchStatus && matchDate;
    });
  }

  // ===== COMPUTED: FILTERED CANDIDATES =====
  get filteredCandidates(): Candidate[] {
    if (!this.selectedJob) return [];
    
    return this.candidates.filter(c => {
      const matchJob = c.jobId === this.selectedJob!.id;
      const matchSearch = c.name.toLowerCase().includes(this.candidateSearchText.toLowerCase()) ||
                         c.email.toLowerCase().includes(this.candidateSearchText.toLowerCase());
      const matchStatus = !this.candidateStatusFilter || c.status === this.candidateStatusFilter;
      
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
    this.jobs = this.jobs.map(job =>
      job.id === jobId
        ? { ...job, status: job.status === 'Mở' ? 'Đóng' : 'Mở' }
        : job
    );

    if (this.selectedJob && this.selectedJob.id === jobId) {
      this.selectedJob = {
        ...this.selectedJob,
        status: this.selectedJob.status === 'Mở' ? 'Đóng' : 'Mở'
      };
    }
  }

  // ===== HANDLERS: MODAL =====
  handleOpenAddModal() {
    this.modalMode = 'add';
    this.editingJobId = null;
    this.newJob = {
      id: 0,
      title: '',
      department: '',
      createdDate: '',
      status: 'Mở',
      description: '',
      recruitmentCount: 0,
      requirements: ''
    };
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
    if (!this.newJob.title.trim()) {
      alert('Vui lòng nhập tên việc làm');
      return;
    }

    if (!this.newJob.department.trim()) {
      alert('Vui lòng nhập phòng ban');
      return;
    }

    if (this.modalMode === 'add') {
      const newId = Math.max(...this.jobs.map(j => j.id), 0) + 1;
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      
      this.jobs.push({
        ...this.newJob,
        id: newId,
        createdDate: formattedDate
      });
    } else if (this.editingJobId !== null) {
      const index = this.jobs.findIndex(j => j.id === this.editingJobId);
      if (index !== -1) {
        this.jobs[index] = { 
          ...this.newJob, 
          id: this.editingJobId,
          createdDate: this.jobs[index].createdDate 
        };
      }

      if (this.selectedJob && this.selectedJob.id === this.editingJobId) {
        this.selectedJob = { 
          ...this.newJob, 
          id: this.editingJobId,
          createdDate: this.selectedJob.createdDate
        };
      }
    }

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
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && !this.isJobClosed) {
      this.currentPage = page;
    }
  }

  previousPage() {
    if (!this.isJobClosed) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (!this.isJobClosed) {
      this.goToPage(this.currentPage + 1);
    }
  }
}