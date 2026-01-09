import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-job-management',
  templateUrl: './job-management.component.html',
  styleUrls: ['./job-management.component.css'],
})
export class JobManagementComponent implements OnInit {
  jobs = [
    {
      name: 'Nhân viên',
      department: 'IT',
      applicants: 5,
      createdDate: '31/12/2025',
      creator: 'Sơn Hà',
      checked: false,
    },
    {
      name: 'Nhân viên',
      department: 'IT',
      applicants: 5,
      createdDate: '31/12/2025',
      creator: 'Sơn Hà',
      checked: false,
    },
    {
      name: 'Nhân viên',
      department: 'IT',
      applicants: 5,
      createdDate: '31/12/2025',
      creator: 'Sơn Hà',
      checked: false,
    },
    {
      name: 'Nhân viên',
      department: 'IT',
      applicants: 5,
      createdDate: '31/12/2025',
      creator: 'Sơn Hà',
      checked: false,
    },
  ];

  departments = ['IT', 'Marketing', 'Nhân sự'];
  jobNames = ['Nhân viên', 'Quản lý'];
  creators = ['Sơn Hà', 'Minh Dương'];

  filters = {
    createdDate: '',
    department: '',
    jobName: '',
    creator: '',
  };

  searchText = '';
  openMenuIndex: number | null = null;

  get filteredJobs() {
    return this.jobs.filter((job) => {
      return (
        (!this.filters.department ||
          job.department === this.filters.department) &&
        (!this.filters.jobName || job.name === this.filters.jobName) &&
        (!this.filters.creator || job.creator === this.filters.creator) &&
        (!this.searchText ||
          job.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
          job.department
            .toLowerCase()
            .includes(this.searchText.toLowerCase()))
      );
    });
  }

  toggleAll(event: any) {
    const checked = event.target.checked;
    this.jobs.forEach((j) => (j.checked = checked));
  }

  resetFilters() {
    this.filters = {
      createdDate: '',
      department: '',
      jobName: '',
      creator: '',
    };
    this.searchText = '';
  }

  toggleMenu(index: number) {
    this.openMenuIndex =
      this.openMenuIndex === index ? null : index;
  }

  ngOnInit(): void {}
}
