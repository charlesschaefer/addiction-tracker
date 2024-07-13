import { TestBed } from '@angular/core/testing';
import { NgxIndexedDBModule, NgxIndexedDBService } from "ngx-indexed-db";
import { importProvidersFrom } from '@angular/core';
import { dbConfig } from "../db.config";

import { CostService } from './cost.service';
import { CostAddDto } from '../dto/cost.dto';

describe('CostService', () => {
  let service: CostService<CostAddDto>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ],
    });
    service = TestBed.inject(CostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
