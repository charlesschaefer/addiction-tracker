import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubstanceSelectorComponent } from './substance-selector.component';

describe('SubstanceSelector', () => {
  let component: SubstanceSelectorComponent;
  let fixture: ComponentFixture<SubstanceSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubstanceSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubstanceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
