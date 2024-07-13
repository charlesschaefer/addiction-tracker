import { TestBed } from '@angular/core/testing';
import { NgxIndexedDBModule, NgxIndexedDBService } from "ngx-indexed-db";
import { importProvidersFrom } from '@angular/core';
import { dbConfig } from "../db.config";

import { SubstanceService } from './substance.service';
import { SubstanceAddDto } from '../dto/substance.dto';

describe('SubstanceService', () => {
  let service: SubstanceService<SubstanceAddDto>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ],
    });
    service = TestBed.inject(SubstanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
