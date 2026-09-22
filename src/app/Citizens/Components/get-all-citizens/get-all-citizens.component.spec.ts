import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetAllCitizensComponent } from './get-all-citizens.component';

describe('GetAllCitizensComponent', () => {
  let component: GetAllCitizensComponent;
  let fixture: ComponentFixture<GetAllCitizensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetAllCitizensComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GetAllCitizensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
