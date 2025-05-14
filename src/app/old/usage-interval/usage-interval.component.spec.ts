import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxIndexedDBModule } from "ngx-indexed-db";
import { importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { dbConfig } from "../../db.config";

import { UsageIntervalComponent } from './usage-interval.component';

describe('UsageIntervalComponent', () => {
  let component: UsageIntervalComponent;
  let fixture: ComponentFixture<UsageIntervalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsageIntervalComponent],
      providers: [
        provideAnimationsAsync(),
        importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsageIntervalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
