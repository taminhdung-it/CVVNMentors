import { Component, OnInit  } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // stats to render cards
  stats = [
    { label: 'Tổng CV', value: '320' },
    { label: 'CV đã nộp', value: '200' },
    { label: 'CV phỏng vấn', value: '70' },
    { label: 'CV đậu', value: '25' },
    { label: 'CV rớt', value: '25' },
    { label: 'Số phòng ban', value: '6' },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const auth = sessionStorage.getItem('auth');

    if (!auth) {
      // ❌ chưa đăng nhập → về login
      this.router.navigate(['/login']);
      return;
    }
 
}
}
