// src/app/layout/header/header.component.ts
import { Component, EventEmitter, Input, Output, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  username = 'Dương không quá';
  pageTitle = 'Dashboard';

  private sub = new Subscription();

  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Lắng nghe navigation end và lấy title từ data của route sâu nhất
    const s = this.router.events.pipe(
      filter(evt => evt instanceof NavigationEnd),
      map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      map(route => route.snapshot.data)
    ).subscribe(data => {
      if (data && data['title']) {
        this.pageTitle = data['title'];
      } else {
        // fallback: nếu route không có title thì đặt tên theo url hoặc 'Tổng quan'
        const url = this.router.url || '';
        if (url.includes('/cv')) this.pageTitle = 'Quản lý CV';
        else if (url.includes('/dashboard')) this.pageTitle = 'Dashboard';
        else this.pageTitle = data && data['pageTitle'] ? data['pageTitle'] : 'Dashboard';
      }
    });

    this.sub.add(s);
  }

  onToggle() {
    this.toggleSidebar.emit();
  }

  // ============================================
  // NAVIGATE TO PROFILE
  // ============================================
  goToProfile() {
    this.router.navigate(['/profile']);
    // Hoặc mở modal thông tin user
    // this.dialog.open(UserProfileDialog);
  }

  // ============================================
  // LOGOUT
  // ============================================
  logout() {
    // Confirm dialog
      // Clear storage
      sessionStorage.clear();
      localStorage.removeItem('qlcv_session');
      localStorage.removeItem('QL_CV_TOKEN');
      
      // Navigate to login
      this.router.navigate(['/login']);
    }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}