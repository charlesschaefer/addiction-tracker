import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostAddComponent } from './cost-add.component';

describe('CostAddComponent', () => {
  let component: CostAddComponent;
  let fixture: ComponentFixture<CostAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
