import { TestBed } from '@angular/core/testing';
import { NgxIndexedDBModule, NgxIndexedDBService } from "ngx-indexed-db";
import { importProvidersFrom } from '@angular/core';
import { dbConfig } from "../db.config";

import { RecommendationService } from './recommendation.service';
import { RecommendationDto } from '../dto/recommendation.dto';

describe('RecommendationService', () => {
  let service: RecommendationService<RecommendationDto>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ],
    });
    service = TestBed.inject(RecommendationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
