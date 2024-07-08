import { TestBed } from '@angular/core/testing';

import { CostService } from './cost.service';

describe('CostService', () => {
  let service: CostService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
