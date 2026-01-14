import { Injectable } from '@angular/core';
import { CV } from '../cv-management/cv-management.component';

@Injectable({
  providedIn: 'root'
})
export class CvService {
  private cvs: CV[] = [];

  /** Lưu toàn bộ danh sách CV */
  setCVs(cvs: CV[]) {
    this.cvs = cvs;
  }

  /** Lấy CV theo ID */
  getCVById(id: number): CV | undefined {
    return this.cvs.find(cv => cv.id === id);
  }

  /** (optional) lấy tất cả */
  getAllCVs(): CV[] {
    return this.cvs;
  }
}
