import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxIndexedDBModule, NgxIndexedDBService } from "ngx-indexed-db";
import { importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { dbConfig } from "../db.config";

import { UsageTrackComponent } from './usage-track.component';

describe('UsageTrackComponent', () => {
  let component: UsageTrackComponent;
  let fixture: ComponentFixture<UsageTrackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsageTrackComponent],
      providers: [
        provideAnimationsAsync(),
        importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
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
});
