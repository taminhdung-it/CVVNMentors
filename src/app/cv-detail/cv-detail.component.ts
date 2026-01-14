import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CvService, CvDetailResponse } from '../auth/auth/cv.service';

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

  /** JOB ĐÃ GÁN (mock – sau này gắn API) */
  assignedJobs: {
    jobName: string;
    department: string;
    status: string;
    assignedDate: string;
    updatedDate: string;
  }[] = [];

  /** JOB FILTER + PAGINATION */
  jobKeyword = '';
  pageIndex = 1;
  pageSize = 5;
  jobSearch: string = '';
  jobStatus: 'ALL' | 'Ứng tuyển' | 'Phỏng vấn' | 'Đạt' | 'Không đạt' = 'ALL';

  /** Danh sách job sau khi lọc */
  get filteredJobs() {
    return this.assignedJobs.filter((j) => {
      const matchName = j.jobName
        .toLowerCase()
        .includes(this.jobSearch.toLowerCase());

      const matchStatus =
        this.jobStatus === 'ALL' || j.status === this.jobStatus;

      return matchName && matchStatus;
    });
  }

  /** Tổng số trang */
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredJobs.length / this.pageSize));
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

  /** JOB ĐÃ GÁN – MOCK DATA */
  loadAssignedJobs() {
    this.assignedJobs = [
      {
        jobName: 'Job #1',
        department: 'IT',
        status: 'Phỏng vấn',
        assignedDate: '31/12/2025',
        updatedDate: '01/01/2026',
      },
      {
        jobName: 'Job #2',
        department: 'IT',
        status: 'Ứng tuyển',
        assignedDate: '30/12/2025',
        updatedDate: '01/01/2026',
      },
    ];
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
