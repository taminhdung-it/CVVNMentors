import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvAddManualComponent } from './cv-add-manual.component';

describe('CvAddManualComponent', () => {
  let component: CvAddManualComponent;
  let fixture: ComponentFixture<CvAddManualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CvAddManualComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CvAddManualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
