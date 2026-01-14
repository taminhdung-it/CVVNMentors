// src/app/services/stats.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface PerJobCount { jobName: string; count: number; }
export interface DashboardStats {
  totalCv: number;
  applied: number;
  interviewing: number;
  hired: number;
  rejected: number;
  departments: number;
  openJobs: number;
  perJobCounts: PerJobCount[];
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  constructor() {}

  // Mock: trả DashboardStats theo dateFrom/dateTo (chuỗi 'YYYY-MM-DD' hoặc undefined)
  getStats(dateFrom?: string, dateTo?: string): Observable<DashboardStats> {
    const mock: DashboardStats = {
      totalCv: 320,
      applied: 200,
      interviewing: 70,
      hired: 25,
      rejected: 25,
      departments: 6,
      openJobs: 12,
      perJobCounts: [
        { jobName: 'Backend Developer', count: 70 },
        { jobName: 'Frontend Developer', count: 60 },
        { jobName: 'Data Scientist', count: 30 },
        { jobName: 'QA Engineer', count: 40 },
        { jobName: 'Product Manager', count: 20 },
      ],
    };
    // mô phỏng delay
    return of(mock).pipe(delay(300));
  }
}
