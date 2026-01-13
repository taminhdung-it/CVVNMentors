import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'app-cv-add-manual',
  templateUrl: './cv-add-manual.component.html',
  styleUrls: ['./cv-add-manual.component.css'],
})
export class CvAddManualComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fullName: [''],
      email: [''],
      phone: [''],
      position: [''],
      level: [''],
      experienceYears: [0],

      skills: [''], // textarea → split thành array
      education: [''], // textarea → split thành array

      experience: this.fb.array([]),
    });
  }

  /** EXPERIENCE ARRAY */
  get experiences(): FormArray<FormGroup> {
    return this.form.get('experience') as FormArray<FormGroup>;
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

  removeExperience(index: number) {
    this.experiences.removeAt(index);
  }

  /** SUBMIT */
  submit() {
    const raw = this.form.value;

    const cvPayload = {
      id: crypto.randomUUID(),
      createdBy: null,
      cvType: 'Manual Entry',
      status: 'NEW',

      fullName: raw.fullName,
      email: raw.email,
      phone: raw.phone,
      position: raw.position,
      level: raw.level,
      experienceYears: Number(raw.experienceYears),

      skills: raw.skills
        ? raw.skills
            .split('\n')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],

      education: raw.education
        ? raw.education
            .split('\n')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],

      experience: raw.experience,
    };

    console.log('CV MANUAL OBJECT:', cvPayload);
    alert('Đã tạo CV (xem console)');
  }

  goBack() {
    history.back();
  }
}
