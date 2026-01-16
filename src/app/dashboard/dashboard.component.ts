import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('barChart') barChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChart!: ElementRef<HTMLCanvasElement>;

  // stats cards
  stats = [
    { label: 'Tổng CV', value: '1.000.000', icon: '📊' },
    { label: 'CV Mới', value: '13.100', icon: '📝' },
  ];

  // table data
  cvData = [
    {
      id: 1,
      name: 'Đào Quốc Sơn Hà',
      position: 'Designer',
      level: 'Level',
      experience: '30 năm',
      status: 'Trạng thái',
      date: '27/11/2025 19:05:05',
    },
    {
      id: 2,
      name: 'Đào Quốc Sơn Hà',
      position: 'Designer',
      level: 'Level',
      experience: '30 năm',
      status: 'Trạng thái',
      date: '27/11/2025 19:05:05',
    },
    {
      id: 3,
      name: 'Đào Quốc Sơn Hà',
      position: 'Designer',
      level: 'Level',
      experience: '30 năm',
      status: 'Trạng thái',
      date: '27/11/2025 19:05:05',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.createBarChart();
    this.createPieChart();
    this.createLineChart();
  }

  createBarChart() {
    const ctx = this.barChart.nativeElement.getContext('2d');
    new Chart(ctx!, {
      type: 'bar',
      data: {
        labels: [
          'T1',
          'T2',
          'T3',
          'T4',
          'T5',
          'T6',
          'T7',
          'T8',
          'T9',
          'T10',
          'T11',
          'T12',
        ],
        datasets: [
          {
            label: 'CV Mới',
            data: [45, 52, 68, 48, 55, 38, 42, 58, 65, 48, 35, 55],
            backgroundColor: '#3b4d61',
            borderRadius: 2,
            barThickness: 14,
          },
          {
            label: 'CV đã duyệt',
            data: [52, 58, 70, 60, 65, 45, 50, 62, 70, 55, 40, 62],
            backgroundColor: '#5da9dd',
            borderRadius: 2,
            barThickness: 14,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              padding: 10,
              font: { size: 10 },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 9 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f0f0f0' },
            ticks: {
              stepSize: 25,
              font: { size: 9 },
            },
          },
        },
      },
    });
  }

  createPieChart() {
    const ctx = this.pieChart.nativeElement.getContext('2d');
    new Chart(ctx!, {
      type: 'doughnut',
      data: {
        labels: [
          'Designer',
          'Manager',
          'Developer',
          'Photoshop',
          'Security',
          'Others',
        ],
        datasets: [
          {
            data: [25, 20, 20, 15, 10, 10],
            backgroundColor: [
              '#4a5f7f',
              '#5d9bd5',
              '#7fb8d4',
              '#9ec5d9',
              '#b8b8b8',
              '#d4d4d4',
            ],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              padding: 10,
              font: { size: 11 },
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              boxHeight: 8,
            },
          },
        },
        cutout: '65%',
      },
    });
  }

  createLineChart() {
    const ctx = this.lineChart.nativeElement.getContext('2d');
    new Chart(ctx!, {
      type: 'line',
      data: {
        labels: ['Entry', '', '', 'Trung', '', '', 'Senior'],
        datasets: [
          {
            label: 'Entry',
            data: [65, 55, 70, 62, 58, 68, 60],
            borderColor: '#3b4d61',
            backgroundColor: 'transparent',
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: 'Trung',
            data: [45, 52, 58, 68, 62, 72, 65],
            borderColor: '#5da9dd',
            backgroundColor: 'transparent',
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: 'Senior',
            data: [55, 62, 68, 60, 70, 65, 58],
            borderColor: '#b8b8b8',
            backgroundColor: 'transparent',
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              padding: 12,
              font: { size: 10 },
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 } },
          },
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: '#f0f0f0' },
            ticks: {
              stepSize: 25,
              font: { size: 10 },
            },
          },
        },
      },
    });
  }
}
