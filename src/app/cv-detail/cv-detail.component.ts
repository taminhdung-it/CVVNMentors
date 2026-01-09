import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface CV {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  status: string;
}

@Component({
  selector: 'app-cv-detail',
  templateUrl: './cv-detail.component.html',
  styleUrls: ['./cv-detail.component.css'],
})
export class CvDetailComponent implements OnInit {
  activeTab: 'profile' | 'jobs' | 'history' = 'profile';

  cv!: CV;

  jobs = [
    {
      name: 'Job #1',
      department: 'IT',
      status: 'Phỏng vấn',
      assignedAt: '31/12/2025',
      updatedAt: '01/01/2026',
    },
    {
      name: 'Job #2',
      department: 'IT',
      status: 'Ứng tuyển',
      assignedAt: '31/12/2025',
      updatedAt: '01/01/2026',
    },
  ];

  histories = [
    {
      time: '21/10/2025 14:30',
      user: 'Admin User',
      action: 'Phê duyệt CV',
      status: 'Đã duyệt',
    },
    {
      time: '21/10/2025 10:15',
      user: 'Admin User',
      action: 'Tải lên file CV_DungHoCao.pdf',
    },
    {
      time: '21/10/2025 09:00',
      user: 'System',
      action: 'Tạo CV mới',
      status: 'Mới',
    },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // MOCK – sau này thay bằng service
    this.cv = {
      id,
      fullName: 'Dũng Họ Cao',
      email: 'nguyenvana@gmail.com',
      phone: '0966381048',
      position: 'Senior Frontend Developer',
      status: 'Mới',
    };
  }

  setTab(tab: 'profile' | 'jobs' | 'history') {
    this.activeTab = tab;
  }
}
