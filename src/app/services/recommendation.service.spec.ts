import { TestBed } from '@angular/core/testing';

import { RecommendationService } from './recommendation.service';
import { RecommendationDto } from '../dto/recommendation.dto';

describe('RecommendationService', () => {
  let service: RecommendationService<RecommendationDto>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecommendationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
