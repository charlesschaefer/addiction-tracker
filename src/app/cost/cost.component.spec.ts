import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostComponent } from './cost.component';

describe('CostComponent', () => {
  let component: CostComponent;
  let fixture: ComponentFixture<CostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
