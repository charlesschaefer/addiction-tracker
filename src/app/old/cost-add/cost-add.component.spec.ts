import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { CostAddComponent } from './cost-add.component';

describe('CostAddComponent', () => {
  let component: CostAddComponent;
  let fixture: ComponentFixture<CostAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostAddComponent],
      providers: [
        provideAnimationsAsync(),
        // importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ]
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
