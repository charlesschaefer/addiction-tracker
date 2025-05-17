import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxIndexedDBModule } from "ngx-indexed-db";
import { importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { dbConfig } from "../../db.config";

import { SubstanceAddComponent } from './substance-add.component';

describe('SubstanceAddComponent', () => {
  let component: SubstanceAddComponent;
  let fixture: ComponentFixture<SubstanceAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubstanceAddComponent],
      providers: [
        provideAnimationsAsync(),
        importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
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
