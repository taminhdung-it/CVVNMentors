import { Component } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  // khi true => sidebar hẹp
  collapsed = false;

  onToggle() {
    this.collapsed = !this.collapsed;
  }
}
