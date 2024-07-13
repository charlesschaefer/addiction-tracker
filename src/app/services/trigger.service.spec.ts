import { TestBed } from '@angular/core/testing';
import { NgxIndexedDBModule, NgxIndexedDBService } from "ngx-indexed-db";
import { importProvidersFrom } from '@angular/core';
import { dbConfig } from "../db.config";

import { TriggerService } from './trigger.service';
import { TriggerAddDto } from '../dto/trigger.dto';

describe('TriggerService', () => {
  let service: TriggerService<TriggerAddDto>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ],
    });
    service = TestBed.inject(TriggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
