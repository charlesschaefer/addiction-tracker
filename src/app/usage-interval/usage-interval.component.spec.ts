import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageIntervalComponent } from './usage-interval.component';

describe('UsageIntervalComponent', () => {
  let component: UsageIntervalComponent;
  let fixture: ComponentFixture<UsageIntervalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsageIntervalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsageIntervalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
