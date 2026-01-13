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

  /** EDIT MODE */
  isEditing = false;
  editModel: Partial<CvDetailResponse> = {};

  constructor(private route: ActivatedRoute, private cvService: CvService) {}

  ngOnInit(): void {
    this.cvId = this.route.snapshot.paramMap.get('id')!;
    this.loadCv();
  }

  loadCv() {
    this.cvService.getCvDetail(this.cvId).subscribe({
      next: (res) => {
        this.cv = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  /* ===== STATUS ===== */
  getStatusLabel(status: string): string {
    return (
      {
        NEW: 'Mới',
        APPROVED: 'Đã duyệt',
        REJECTED: 'Không đạt',
        ARCHIVED: 'Lưu trữ',
      } as any
    )[status];
  }

  statusClass(status: string) {
    return `status-${status.toLowerCase()}`;
  }

  /* ===== DATE ===== */
  get createdDate(): string {
    if (!this.cv?.createdAt?._seconds) return '-';
    return new Date(this.cv.createdAt._seconds * 1000).toLocaleDateString(
      'vi-VN'
    );
  }

  /* ===== PDF ===== */
  viewPdf() {
    window.open(this.cv.cvFileUrl, '_blank');
  }

  downloadPdf() {
    const a = document.createElement('a');
    a.href = this.cv.cvFileUrl;
    a.download = '';
    a.click();
  }

  /* ===== EDIT INFO ===== */
  enableEdit() {
    this.isEditing = true;
    this.editModel = {
      email: this.cv.email,
      phone: this.cv.phone,
      position: this.cv.position,
      level: this.cv.level,
    };
  }

  cancelEdit() {
    this.isEditing = false;
  }

  saveInfo() {
    this.cvService.updateCvInfo(this.cvId, this.editModel).subscribe({
      next: () => {
        Object.assign(this.cv, this.editModel);
        this.isEditing = false;
      },
    });
  }
}
