import { TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';

import { CostService } from './cost.service';
import { CostAddDto } from '../dto/cost.dto';

describe('CostService', () => {
  let service: CostService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ],
    });
    service = TestBed.inject(CostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
