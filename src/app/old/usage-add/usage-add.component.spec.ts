import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { UsageAddComponent } from './usage-add.component';

describe('UsageAddComponent', () => {
  let component: UsageAddComponent;
  let fixture: ComponentFixture<UsageAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsageAddComponent],
      providers: [
        provideAnimationsAsync(),
        // importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsageAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
