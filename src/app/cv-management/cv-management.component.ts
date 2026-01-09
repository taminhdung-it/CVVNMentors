import { Component, OnInit } from '@angular/core';

interface CV {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cvType: 'Có CV' | 'Không CV';
  status: 'Mới' | 'Duyệt' | 'Không đạt' | 'Lưu trữ';
  job?: string;
  department?: string;
  updatedAt: string;
  checked?: boolean;
}

@Component({
  selector: 'app-cv-management',
  templateUrl: './cv-management.component.html',
  styleUrls: ['./cv-management.component.css']
})
export class CvManagementComponent implements OnInit {

  data: CV[] = [];
  viewData: CV[] = [];

  // filter
  keyword = '';
  cvType = '';
  status = '';

  // pagination
  page = 1;
  pageSize = 5;

  ngOnInit() {
    this.data = this.mockData();
    this.applyFilter();
  }

  mockData(): CV[] {
    return [
      {
        id: '1',
        fullName: 'Đào Quốc Sơn Hà',
        email: 'sonhadaoquoc@gmail.com',
        phone: '0927000888',
        cvType: 'Có CV',
        status: 'Mới',
        updatedAt: '31/12/2025'
      },
      {
        id: '2',
        fullName: 'Đào Quốc Sơn Hà',
        email: 'sonhadaoquoc@gmail.com',
        phone: '0927000888',
        cvType: 'Không CV',
        status: 'Duyệt',
        job: 'Front-end Dev',
        department: 'Phòng IT',
        updatedAt: '31/12/2025'
      },
      {
        id: '3',
        fullName: 'Đào Quốc Sơn Hà',
        email: 'sonhadaoquoc@gmail.com',
        phone: '0927000888',
        cvType: 'Có CV',
        status: 'Không đạt',
        job: 'Front-end Dev',
        department: 'Phòng IT',
        updatedAt: '31/12/2025'
      },
      {
        id: '4',
        fullName: 'Đào Quốc Sơn Hà',
        email: 'sonhadaoquoc@gmail.com',
        phone: '0927000888',
        cvType: 'Không CV',
        status: 'Lưu trữ',
        job: 'Front-end Dev',
        department: 'Phòng IT',
        updatedAt: '31/12/2025'
      }
    ];
  }

  applyFilter() {
    let result = [...this.data];

    if (this.keyword) {
      const k = this.keyword.toLowerCase();
      result = result.filter(x =>
        x.fullName.toLowerCase().includes(k) ||
        x.email.toLowerCase().includes(k) ||
        x.phone.includes(k)
      );
    }

    if (this.cvType) {
      result = result.filter(x => x.cvType === this.cvType);
    }

    if (this.status) {
      result = result.filter(x => x.status === this.status);
    }

    this.page = 1;
    this.viewData = result;
  }

  clearFilter() {
    this.keyword = '';
    this.cvType = '';
    this.status = '';
    this.applyFilter();
  }

  get pagedData() {
    const start = (this.page - 1) * this.pageSize;
    return this.viewData.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.viewData.length / this.pageSize);
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
