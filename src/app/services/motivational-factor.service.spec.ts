import { TestBed } from '@angular/core/testing';

import { MotivationalFactorService } from './motivational-factor.service';

describe('MotivationalFactorService', () => {
  let service: MotivationalFactorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotivationalFactorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
