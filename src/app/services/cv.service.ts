import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

// ============================================
// INTERFACES
// ============================================

export interface CV {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cvType: 'Có CV' | 'Không CV';
  position?: string;
  fileUrl?: string;
  fileName?: string;
  cvStatus: 'Mới' | 'Duyệt' | 'Không đạt' | 'Lưu trữ';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CVFilter {
  keyword?: string;
  cvType?: string;
  cvStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface CVListResponse {
  data: CV[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CVStats {
  total: number;
  new: number;
  approved: number;
  rejected: number;
  archived: number;
}

// ============================================
// SERVICE
// ============================================

@Injectable({
  providedIn: 'root'
})
export class CvService {
  
  private apiUrl = '/api/cv'; // Thay đổi theo backend của bạn
  
  // State management với BehaviorSubject
  private cvListSubject = new BehaviorSubject<CV[]>([]);
  private statsSubject = new BehaviorSubject<CVStats>({
    total: 0,
    new: 0,
    approved: 0,
    rejected: 0,
    archived: 0
  });

  cvList$ = this.cvListSubject.asObservable();
  stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============================================
  // GET CV LIST WITH FILTERS
  // ============================================
  
  getCVList(filter: CVFilter): Observable<CVListResponse> {
    let params = new HttpParams();
    
    if (filter.keyword) params = params.set('keyword', filter.keyword);
    if (filter.cvType) params = params.set('cvType', filter.cvType);
    if (filter.cvStatus) params = params.set('cvStatus', filter.cvStatus);
    if (filter.dateFrom) params = params.set('dateFrom', filter.dateFrom);
    if (filter.dateTo) params = params.set('dateTo', filter.dateTo);
    if (filter.page) params = params.set('page', filter.page.toString());
    if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());

    return this.http.get<CVListResponse>(`${this.apiUrl}/list`, { params }).pipe(
      tap(response => {
        this.cvListSubject.next(response.data);
      })
    );
  }

  // ============================================
  // GET CV STATS
  // ============================================
  
  getCVStats(): Observable<CVStats> {
    return this.http.get<CVStats>(`${this.apiUrl}/stats`).pipe(
      tap(stats => {
        this.statsSubject.next(stats);
      })
    );
  }

  // ============================================
  // GET SINGLE CV
  // ============================================
  
  getCVById(id: string): Observable<CV> {
    return this.http.get<CV>(`${this.apiUrl}/${id}`);
  }

  // ============================================
  // CREATE CV (Upload File)
  // ============================================
  
  createCV(formData: FormData): Observable<CV> {
    return this.http.post<CV>(`${this.apiUrl}/create`, formData);
  }

  // ============================================
  // CREATE CV (Manual Input - No File)
  // ============================================
  
  createCVManual(cvData: Partial<CV>): Observable<CV> {
    return this.http.post<CV>(`${this.apiUrl}/create-manual`, cvData);
  }

  // ============================================
  // IMPORT CV FROM EXCEL
  // ============================================
  
  importCVFromExcel(file: File): Observable<{ success: number; failed: number }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<{ success: number; failed: number }>(
      `${this.apiUrl}/import-excel`, 
      formData
    );
  }

  // ============================================
  // UPDATE CV
  // ============================================
  
  updateCV(id: string, cvData: Partial<CV>): Observable<CV> {
    return this.http.put<CV>(`${this.apiUrl}/${id}`, cvData);
  }

  // ============================================
  // UPDATE CV STATUS (Duyệt / Không đạt / Lưu trữ)
  // ============================================
  
  updateCVStatus(id: string, status: CV['cvStatus']): Observable<CV> {
    return this.http.patch<CV>(`${this.apiUrl}/${id}/status`, { status });
  }

  // ============================================
  // BULK UPDATE STATUS
  // ============================================
  
  bulkUpdateStatus(ids: string[], status: CV['cvStatus']): Observable<{ updated: number }> {
    return this.http.post<{ updated: number }>(`${this.apiUrl}/bulk-status`, {
      ids,
      status
    });
  }

  // ============================================
  // DELETE CV
  // ============================================
  
  deleteCV(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ============================================
  // BULK DELETE
  // ============================================
  
  bulkDeleteCV(ids: string[]): Observable<{ deleted: number }> {
    return this.http.post<{ deleted: number }>(`${this.apiUrl}/bulk-delete`, { ids });
  }

  // ============================================
  // ASSIGN CV TO JOB (Tạo Application)
  // ============================================
  
  assignToJob(cvIds: string[], jobId: string): Observable<{ created: number }> {
    return this.http.post<{ created: number }>(`${this.apiUrl}/assign-job`, {
      cvIds,
      jobId
    });
  }

  // ============================================
  // DOWNLOAD CV FILE
  // ============================================
  
  downloadCV(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  // ============================================
  // EXPORT TO EXCEL
  // ============================================
  
  exportToExcel(filter: CVFilter): Observable<Blob> {
    let params = new HttpParams();
    
    if (filter.keyword) params = params.set('keyword', filter.keyword);
    if (filter.cvType) params = params.set('cvType', filter.cvType);
    if (filter.cvStatus) params = params.set('cvStatus', filter.cvStatus);
    
    return this.http.get(`${this.apiUrl}/export-excel`, {
      params,
      responseType: 'blob'
    });
  }

  // ============================================
  // GET CV APPLICATION HISTORY
  // ============================================
  
  getCVApplicationHistory(cvId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${cvId}/applications`);
  }

  // ============================================
  // SEARCH SUGGESTIONS
  // ============================================
  
  searchSuggestions(keyword: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/search-suggestions`, {
      params: { keyword }
    });
  }

  // ============================================
  // VALIDATE EMAIL/PHONE (Check Duplicate)
  // ============================================
  
  checkDuplicate(field: 'email' | 'phone', value: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/check-duplicate`, {
      params: { field, value }
    });
  }

  // ============================================
  // HELPER: Get current CV list from state
  // ============================================
  
  getCurrentCVList(): CV[] {
    return this.cvListSubject.value;
  }

  // ============================================
  // HELPER: Get current stats from state
  // ============================================
  
  getCurrentStats(): CVStats {
    return this.statsSubject.value;
  }
}