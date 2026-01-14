import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvImportExcelComponent } from './cv-import-excel.component';

describe('CvImportExcelComponent', () => {
  let component: CvImportExcelComponent;
  let fixture: ComponentFixture<CvImportExcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CvImportExcelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvImportExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
