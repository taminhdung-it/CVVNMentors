import { Component, Input } from '@angular/core';

interface NavItem {
  heading?: string;
  title?: string;
  icon?: string;
  route?: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() collapsed: boolean = false;

  nav: NavItem[] = [
    {
      heading: 'Trang chủ'
    },
    {
      title: 'Dashboard',
      icon: 'grid',
      route: '/dashboard'  // ✅ Đúng
    },
    {
      title: 'Thống kê',
      icon: 'chart',
      route: '/statistics'  // ⚠️ Chưa có trong routing - cần thêm
    },
    {
      heading: 'Quản lý'
    },
    {
      title: 'Quản lý CV',
      icon: 'user',
      route: '/cv'  // ✅ SỬA TỪ '/cv-management' → '/cv'
    },
    {
      title: 'Quản lý công việc',
      icon: 'briefcase',
      route: '/jobmanagement'  // ✅ SỬA TỪ '/job-management' → '/jobmanagement'
    },
    {
      title: 'Quản lý phòng ban',
      icon: 'building',
      route: '/departments'  // ✅ Đã đúng
    },
    {
      heading: 'Hệ thống'
    },
    {
      title: 'Cài đặt',
      icon: 'settings',
      route: '/settings'  // ⚠️ Chưa có trong routing - cần thêm
    }
  ];
}