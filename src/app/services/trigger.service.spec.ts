import { TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';


import { TriggerService } from './trigger.service';
import { TriggerAddDto } from '../dto/trigger.dto';

describe('TriggerService', () => {
  let service: TriggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        //importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ],
    });
    service = TestBed.inject(TriggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
