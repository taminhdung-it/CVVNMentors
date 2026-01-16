import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeChangePasswordModalComponent } from './employee-change-password-modal.component';

describe('EmployeeChangePasswordModalComponent', () => {
  let component: EmployeeChangePasswordModalComponent;
  let fixture: ComponentFixture<EmployeeChangePasswordModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeChangePasswordModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeChangePasswordModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
