import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { UsageTrackComponent } from './usage-track.component';
import { UsageDto } from '../../dto/usage.dto';

describe('UsageTrackComponent', () => {
  let component: UsageTrackComponent;
  let fixture: ComponentFixture<UsageTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsageTrackComponent],
      providers: [
        provideAnimationsAsync(),
        // importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsageTrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the most used trigger', () => {
    const usages: UsageDto[] = [
      {id: 1, craving: 1, datetime: new Date, quantity: 2, sentiment: 1, substance: 1, trigger: [{name: "trigger1"}, {name: 'trigger2'}]},
      {id: 2, craving: 1, datetime: new Date, quantity: 2, sentiment: 1, substance: 1, trigger: [{name: 'trigger2'}]},
    ];

    //let mostUsed = component.getMostUsedTrigger(usages);
    //expect(mostUsed).toEqual(["trigger2", 4]);
  })

});
