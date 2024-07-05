import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubstanceAddComponent } from './substance-add.component';

describe('SubstanceAddComponent', () => {
  let component: SubstanceAddComponent;
  let fixture: ComponentFixture<SubstanceAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubstanceAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubstanceAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
