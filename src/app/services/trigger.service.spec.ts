import { TestBed } from '@angular/core/testing';

import { TriggerService } from './trigger.service';

describe('TriggerService', () => {
  let service: TriggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TriggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
