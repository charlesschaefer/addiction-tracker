import { TestBed } from '@angular/core/testing';

import { SubstanceService } from './substance.service';

describe('SubstanceService', () => {
  let service: SubstanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubstanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
