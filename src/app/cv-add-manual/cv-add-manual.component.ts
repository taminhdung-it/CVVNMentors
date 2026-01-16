import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { CvManualService } from '../auth/auth/cv-manual.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cv-add-manual',
  templateUrl: './cv-add-manual.component.html',
  styleUrls: ['./cv-add-manual.component.css'],
})
export class CvAddManualComponent {
  form: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private cvManualService: CvManualService,
    private router: Router
  ) {
    this.form = this.fb.group({
      fullName: [''],
      email: [''],
      phone: [''],
      cccd: [''],
      position: [''],
      level: [''],
      experienceYears: [0],
      skills: [''],
      education: [''],
      experience: this.fb.array([]),
    });
  }

  get experiences(): FormArray {
    return this.form.get('experience') as FormArray;
  }

  addExperience() {
    this.experiences.push(
      this.fb.group({
        title: [''],
        dates: [''],
        location: [''],
        organization: [''],
      })
    );
  }

  removeExperience(i: number) {
    this.experiences.removeAt(i);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile =
      input.files && input.files.length > 0 ? input.files[0] : null;
  }

  submit() {
    const raw = this.form.value;
    const fd = new FormData();

    // ✅ FILE: CÓ thì gửi – KHÔNG có thì bỏ qua
    if (this.selectedFile) {
      fd.append('file', this.selectedFile);
    }

    fd.append('cvType', 'Manual Entry');
    fd.append('fullName', raw.fullName);
    fd.append('email', raw.email);
    fd.append('phone', raw.phone);
    if (raw.cccd) {
      fd.append('cccd', raw.cccd); // ✅ THÊM
    }
    fd.append('position', raw.position);
    fd.append('level', raw.level);
    fd.append('experienceYears', String(raw.experienceYears));

    // skills (array<string>)
    raw.skills
      ?.split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean)
      .forEach((s: string) => fd.append('skills', s));

    // education (array<string>)
    raw.education
      ?.split('\n')
      .map((e: string) => e.trim())
      .filter(Boolean)
      .forEach((e: string) => fd.append('education', e));

    // experience (string JSON)
    fd.append('experience', JSON.stringify(raw.experience));

    this.cvManualService.createManualCv(fd).subscribe({
      next: (res) => {
        console.log('CREATED CV:', res);

        // ✅ chuyển về danh sách CV
        this.router.navigate(['/cv']);
      },
      error: (err) => {
        console.error(err);
        alert('Tạo CV thất bại');
      },
    });
  }

  goBack() {
    history.back();
  }
}
