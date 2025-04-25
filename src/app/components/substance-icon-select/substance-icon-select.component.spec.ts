import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubstanceIconSelectComponent } from './substance-icon-select.component';

describe('SubstanceIconSelectComponent', () => {
  let component: SubstanceIconSelectComponent;
  let fixture: ComponentFixture<SubstanceIconSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubstanceIconSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubstanceIconSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
