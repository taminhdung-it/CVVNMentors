import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CvService, CvDetailResponse } from '../auth/auth/cv.service';

interface ApplicationHistory {
  id: string;
  jobName: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-cv-detail',
  templateUrl: './cv-detail.component.html',
  styleUrls: ['./cv-detail.component.css'],
})
export class CvDetailComponent implements OnInit {
  cvId!: string;
  cv!: CvDetailResponse;
  loading = true;

  /** TAB */
  activeTab: 'profile' | 'jobs' = 'profile';

  assignedJobs: ApplicationHistory[] = [];
  jobLoading = false;
  jobPage = 1;
  jobLimit = 10;
  jobTotalPages = 1;

  /** JOB FILTER + PAGINATION */
  jobKeyword = '';
  pageIndex = 1;
  pageSize = 5;
  jobSearch: string = '';
  jobStatus: 'ALL' | 'Ứng tuyển' | 'Phỏng vấn' | 'Đạt' | 'Không đạt' = 'ALL';

  /** Danh sách job sau khi lọc */
  get filteredJobs() {
    return this.assignedJobs.filter((j) => {
      const name = (j.jobName || '').toLowerCase();
      const keyword = this.jobSearch.toLowerCase().trim();

      const matchName = !keyword || name.includes(keyword);
      const matchStatus =
        this.jobStatus === 'ALL' || j.status === this.jobStatus;

      return matchName && matchStatus;
    });
  }

  onFilterChange() {
    this.pageIndex = 1;
  }

  /** Tổng số trang */
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredJobs.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedJobs() {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.filteredJobs.slice(start, start + this.pageSize);
  }

  /** Chuyển trang */
  changePage(next: number) {
    if (next < 1 || next > this.totalPages) return;
    this.pageIndex = next;
  }

  /** EDIT */
  isEditing = false;
  editModel: Partial<CvDetailResponse> & {
    skillsString?: string;
  } = {};

  constructor(private route: ActivatedRoute, private cvService: CvService) {}

  ngOnInit(): void {
    this.cvId = this.route.snapshot.paramMap.get('id')!;
    this.loadCv();
    this.loadAssignedJobs();
    this.pageIndex = 1;
  }

  loadCv() {
    this.cvService.getCvDetail(this.cvId).subscribe({
      next: (res: any) => {
        this.cv = {
          ...res,

          // 🔥 MAP field import Excel → field FE dùng
          fullName: res.fullName ?? res.full_name ?? 'Unknown',

          experienceYears: res.experienceYears ?? res.experience_year ?? 0,
        };

        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  loadAssignedJobs() {
    this.jobLoading = true;

    this.cvService
      .getApplicationsByCv(this.cvId, this.jobPage, this.jobLimit)
      .subscribe({
        next: (res: any) => {
          const data = res?.data || [];

          this.assignedJobs = data.map((a: any) => ({
            id: a.id,
            jobName: a.job?.name || 'N/A',
            status: this.mapApplicationStatus(a.status),
            appliedAt: this.formatDate(a.appliedAt),
            updatedAt: this.formatDate(a.updatedAt),
          }));

          this.jobTotalPages = res?.meta?.totalPages || 1;
          this.jobLoading = false;
        },
        error: (err) => {
          console.error('Load application history failed', err);
          this.jobLoading = false;
        },
      });
  }

  mapApplicationStatus(status: string): string {
    switch (status) {
      case 'APPLIED':
        return 'Ứng tuyển';
      case 'INTERVIEW':
        return 'Phỏng vấn';
      case 'OFFER':
        return 'Đạt';
      case 'REJECTED':
        return 'Không đạt';
      default:
        return status;
    }
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  }

  /** STATUS */
  getStatusLabel(status: string): string {
    return {
      NEW: 'Mới',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Không đạt',
      ARCHIVED: 'Lưu trữ',
    }[status]!;
  }

  statusClass(status: string) {
    return `status-${status.toLowerCase()}`;
  }

  /** DATE */
  get createdDate(): string {
    if (!this.cv?.createdAt?._seconds) return '-';
    return new Date(this.cv.createdAt._seconds * 1000).toLocaleDateString(
      'vi-VN'
    );
  }

  /** FILE */
  viewPdf() {
    window.open(this.cv.cvFileUrl, '_blank');
  }

  downloadPdf() {
    const a = document.createElement('a');
    a.href = this.cv.cvFileUrl;
    a.download = '';
    a.click();
  }

  /** EDIT */
  enableEdit() {
    this.isEditing = true;

    this.editModel = {
      fullName: this.cv.fullName,
      email: this.cv.email,
      phone: this.cv.phone,
      position: this.cv.position,
      level: this.cv.level,
      experienceYears: this.cv.experienceYears,
      education: this.cv.education?.length ? [...this.cv.education] : [''],
      skills: this.cv.skills ? [...this.cv.skills] : [],
      skillsString: this.cv.skills?.join(', ') || '',
      experience: this.cv.experience?.length
        ? this.cv.experience.map((e) => ({
            title: e.title || '',
            organization: e.organization || '',
            dates: e.dates || '',
            location: e.location || '',
          }))
        : [
            {
              title: '',
              organization: '',
              dates: '',
              location: '',
            },
          ],
    };
  }

  addExperience() {
    if (!this.editModel.experience) {
      this.editModel.experience = [];
    }

    this.editModel.experience.push({
      title: '',
      organization: '',
      dates: '',
      location: '',
    });
  }

  get canRemoveExperience(): boolean {
    return (this.editModel.experience?.length ?? 0) > 1;
  }

  removeExperience(index: number) {
    if (!this.editModel.experience) return;
    this.editModel.experience.splice(index, 1);
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveInfo() {
    // xử lý skills
    if (this.editModel.skillsString !== undefined) {
      this.editModel.skills = this.editModel.skillsString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      delete this.editModel.skillsString;
    }

    // 🔥 FILTER EXPERIENCE RỖNG
    const experience = (this.editModel.experience || []).filter(
      (e) =>
        e.title?.trim() ||
        e.organization?.trim() ||
        e.dates?.trim() ||
        e.location?.trim()
    );

    const payload = {
      ...this.editModel,
      experience,
    };

    this.cvService.updateCvInfo(this.cvId, payload).subscribe({
      next: () => {
        // ✅ reload lại CV từ server
        this.loadCv();
        this.isEditing = false;
      },
      error: (err) => {
        console.error('Update CV failed', err);
        alert('Lưu thông tin thất bại');
      },
    });
  }
}
