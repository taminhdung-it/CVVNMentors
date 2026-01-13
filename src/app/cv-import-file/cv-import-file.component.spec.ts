import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvImportFileComponent } from './cv-import-file.component';

describe('CvImportFileComponent', () => {
  let component: CvImportFileComponent;
  let fixture: ComponentFixture<CvImportFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CvImportFileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvImportFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
