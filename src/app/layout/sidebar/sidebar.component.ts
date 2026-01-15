import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() collapsed = false;

  // items for menu (icon uses inline svg)
  nav = [
    { title: 'Dashboard', icon: 'grid', route: '/dashboard' },
    { title: 'Thống kê', icon: 'chart', route: '/statistics' },

    { heading: 'Quản lý' },
    { title: 'Quản lý CV', icon: 'user', route: '/cv' },
    { title: 'Quản lý Job', icon: 'store', route: '/jobmanagement' },
    { title: 'Quản lý phòng ban', icon: 'staff', route: '/department-management' },
    { title: 'Tài khoản', icon: 'account', route: '/accounts' },

    { heading: 'HỆ THỐNG' },
    { title: 'Cài đặt', icon: 'settings', route: '/settings' },
  ];
}