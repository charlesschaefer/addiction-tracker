import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageTrackComponent } from './usage-track.component';

describe('UsageTrackComponent', () => {
  let component: UsageTrackComponent;
  let fixture: ComponentFixture<UsageTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsageTrackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsageTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
