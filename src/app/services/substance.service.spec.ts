import { TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';

import { SubstanceService } from './substance.service';
import { SubstanceAddDto } from '../dto/substance.dto';

describe('SubstanceService', () => {
  let service: SubstanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        //importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ],
    });
    service = TestBed.inject(SubstanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
