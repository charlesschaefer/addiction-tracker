import { TestBed } from '@angular/core/testing';

import { AlternativeActivityService } from './alternative-activity.service';

describe('AlternativeActivityService', () => {
  let service: AlternativeActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlternativeActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
