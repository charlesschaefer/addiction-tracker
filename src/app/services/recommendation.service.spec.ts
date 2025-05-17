import { TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';

import { RecommendationService } from './recommendation.service';
import { RecommendationDto } from '../dto/recommendation.dto';

describe('RecommendationService', () => {
  let service: RecommendationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ],
    });
    service = TestBed.inject(RecommendationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
