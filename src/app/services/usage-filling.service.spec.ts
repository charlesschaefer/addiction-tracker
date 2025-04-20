import { TestBed } from '@angular/core/testing';

import { UsageFillingService } from './usage-filling.service';

describe('UsageFillingService', () => {
  let service: UsageFillingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsageFillingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
