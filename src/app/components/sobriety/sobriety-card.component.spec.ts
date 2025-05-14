import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SobrietyCardComponent } from './sobriety-card.component';

describe('SobrietyCardComponent', () => {
  let component: SobrietyCardComponent;
  let fixture: ComponentFixture<SobrietyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SobrietyCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SobrietyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
