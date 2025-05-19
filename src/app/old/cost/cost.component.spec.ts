import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostComponent } from './cost.component';

describe('CostComponent', () => {
  let component: CostComponent;
  let fixture: ComponentFixture<CostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CostComponent],
      providers: [
        // importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ]
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
