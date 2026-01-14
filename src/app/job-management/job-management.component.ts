import { Component } from '@angular/core';

interface Candidate {
  id: number;
  name: string;
  email: string;
  status: 'Ứng tuyển' | 'Phỏng vấn';
  hasCV: boolean;
  updatedAt: string;
  selected: boolean;
}

interface Job {
  code: string;
  title: string;
  department: string;
  applicantCount: number;
  appliedDate: string;
  status: 'Chưa ứng tuyển' | 'Đang chờ' | 'Đã ứng tuyển';
}

@Component({
  selector: 'app-job-management',
  templateUrl: './job-management.component.html',
  styleUrls: ['./job-management.component.css'],
})
export class JobManagementComponent {
  // ===== JOB STATE =====
  jobStatus: 'OPEN' | 'CLOSED' = 'OPEN';

  activeTab: 'candidates' | 'job-list' | 'job-info' | 'history' = 'candidates';

  // ===== FILTER =====
  searchText = '';
  statusFilter = '';

  // ===== PAGINATION =====
  currentPage = 1;
  pageSize = 5;

  // ===== DATA: CANDIDATES =====
  candidates: Candidate[] = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@gmail.com',
      status: 'Ứng tuyển',
      hasCV: true,
      updatedAt: '21/10/2023',
      selected: false,
    },
    {
      id: 2,
      name: 'Trần Thị B',
      email: 'tranthib@gmail.com',
      status: 'Phỏng vấn',
      hasCV: true,
      updatedAt: '20/10/2025',
      selected: false,
    },
    {
      id: 3,
      name: 'Lê Văn C',
      email: 'levanc@gmail.com',
      status: 'Ứng tuyển',
      hasCV: true,
      updatedAt: '19/10/2025',
      selected: false,
    },
  ];

  // ===== DATA: JOB LIST =====
  jobs: Job[] = [
    {
      code: 'JOB-001',
      title: 'Frontend Developer',
      department: 'IT',
      applicantCount: 12,
      appliedDate: '20/10/2025',
      status: 'Đang chờ',
    },
    {
      code: 'JOB-002',
      title: 'Backend Developer',
      department: 'IT',
      applicantCount: 8,
      appliedDate: '18/10/2025',
      status: 'Đã ứng tuyển',
    },
    {
      code: 'JOB-003',
      title: 'Tester',
      department: 'QA',
      applicantCount: 0,
      appliedDate: '-',
      status: 'Chưa ứng tuyển',
    },
  ];

  selectedJob?: Job;

  // ===== TAB =====
  setTab(tab: 'candidates' | 'job-list' | 'job-info' | 'history') {
    this.activeTab = tab;
  }

  // ===== JOB STATUS =====
  toggleJobStatus() {
    this.jobStatus = this.jobStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
  }

  // ===== FILTERED CANDIDATES =====
  get filteredCandidates(): Candidate[] {
    return this.candidates.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        c.email.toLowerCase().includes(this.searchText.toLowerCase());

      const matchStatus =
        !this.statusFilter || c.status === this.statusFilter;

      return matchSearch && matchStatus;
    });
  }

  // ===== HEADCOUNT =====
  get headcount(): number {
    return this.filteredCandidates.length;
  }

  // ===== PAGINATION =====
  get totalPages(): number {
    return Math.ceil(this.filteredCandidates.length / this.pageSize);
  }

  get paginatedCandidates(): Candidate[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCandidates.slice(start, start + this.pageSize);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ===== CHECKBOX =====
  toggleAll(checked: boolean) {
    this.paginatedCandidates.forEach((c) => (c.selected = checked));
  }

  // ===== VIEW JOB DETAIL =====
  viewJobDetail(job: Job) {
    this.selectedJob = job;
    this.setTab('job-info');
  }
  // ===== MODAL ADD JOB =====
showAddJobModal = false;
modalMode: 'add' | 'edit' = 'add';
editingIndex: number | null = null;
newJob: Job = {
  code: '',
  title: '',
  department: '',
  applicantCount: 0,
  appliedDate: '',
  status: 'Chưa ứng tuyển',
};
openEditJobModal(job: Job, index: number) {
  this.modalMode = 'edit';
  this.editingIndex = index;
  this.newJob = { ...job };
  this.showAddJobModal = true;
}

openAddJobModal() {
  this.modalMode = "add";
  this.editingIndex = null;
  this.resetNewJob();
  this.showAddJobModal = true;
}

closeAddJobModal() {
  this.showAddJobModal = false;
}

resetNewJob() {
  this.newJob = {
    code: '',
    title: '',
    department: '',
    applicantCount: 0,
    appliedDate: '',
    status: 'Chưa ứng tuyển',
  };
}

saveJob() {
  if (!this.newJob.code || !this.newJob.title) {
    alert('Vui lòng nhập Mã job và Tên việc làm');
    return;
  }

  this.jobs.push({ ...this.newJob });
  this.closeAddJobModal();
}


}
