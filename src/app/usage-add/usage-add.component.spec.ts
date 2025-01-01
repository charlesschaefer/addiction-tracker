import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxIndexedDBModule } from "ngx-indexed-db";
import { importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { dbConfig } from "../db.config";

import { UsageAddComponent } from './usage-add.component';

describe('UsageAddComponent', () => {
  let component: UsageAddComponent;
  let fixture: ComponentFixture<UsageAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsageAddComponent],
      providers: [
        provideAnimationsAsync(),
        importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
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
