import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CvUploadFileService {
  private API = 'https://cvvnmentors.onrender.com/cv/upload';

  constructor(private http: HttpClient) {}

  uploadFiles(
    files: File[],
    accessToken: string,
    refreshToken: string,
    accountId: string
  ): Observable<any> {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      refreshtoken: refreshToken,
      accountid: accountId,
      router: 'cv/readpdfdoc',
    });

    return this.http.post(this.API, formData, { headers });
  }
}
