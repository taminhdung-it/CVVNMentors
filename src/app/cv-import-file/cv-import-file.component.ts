import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cv-import-file',
  templateUrl: './cv-import-file.component.html',
  styleUrls: ['./cv-import-file.component.css'],
})
export class CvImportFileComponent {
  selectedFiles: File[] = [];

  constructor(private location: Location) {}

  // Quay lại
  goBack(): void {
    this.location.back();
  }

  // Chọn file PDF / DOC / DOCX
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.selectedFiles = Array.from(input.files);
    input.value = '';
  }

  // Tải file mẫu (demo)
  downloadTemplate(): void {
    const link = document.createElement('a');
    link.href = 'assets/templates/cv-template.docx';
    link.download = 'cv-template.docx';
    link.click();
  }
}
