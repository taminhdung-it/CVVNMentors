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

@Component({
  selector: 'app-job-management',
  templateUrl: './job-management.component.html',
  styleUrls: ['./job-management.component.css'],
})
export class JobManagementComponent {
  // ===== JOB STATE =====
  jobStatus: 'OPEN' | 'CLOSED' = 'OPEN';

  activeTab: 'candidates' | 'job-info' | 'history' = 'candidates';

  // ===== FILTER =====
  searchText = '';
  statusFilter = '';

  // ===== PAGINATION =====
  currentPage = 1;
  pageSize = 5;

  // ===== DATA =====
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

  // ===== TAB =====
  setTab(tab: 'candidates' | 'job-info' | 'history') {
    this.activeTab = tab;
  }

  // ===== JOB STATUS =====
  toggleJobStatus() {
    this.jobStatus = this.jobStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
  }

  // ===== FILTERED DATA =====
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

  // ===== HEADCOUNT (ĐẾM CV DƯỚI TABLE) =====
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

  toggleOne() {
    // để trống cũng được, Angular tự update selected
  }
}