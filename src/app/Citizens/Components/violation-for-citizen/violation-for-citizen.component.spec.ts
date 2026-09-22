import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViolationForCitizenComponent } from './violation-for-citizen.component';

describe('ViolationForCitizenComponent', () => {
  let component: ViolationForCitizenComponent;
  let fixture: ComponentFixture<ViolationForCitizenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViolationForCitizenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViolationForCitizenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
