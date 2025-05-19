import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { SubstanceAddComponent } from './substance-add.component';

describe('SubstanceAddComponent', () => {
  let component: SubstanceAddComponent;
  let fixture: ComponentFixture<SubstanceAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubstanceAddComponent],
      providers: [
        provideAnimationsAsync(),
        // importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ]
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
