import { TestBed } from '@angular/core/testing';

import { OtpGeneratorService } from './otp-generator.service';

describe('OtpGeneratorService', () => {
  let service: OtpGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtpGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
