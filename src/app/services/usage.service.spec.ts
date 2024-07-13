import { TestBed } from '@angular/core/testing';
import { NgxIndexedDBModule, NgxIndexedDBService } from "ngx-indexed-db";
import { importProvidersFrom } from '@angular/core';
import { dbConfig } from "../db.config";

import { FinalUsage, UsageService } from './usage.service';
import { UsageDto } from '../dto/usage.dto';

describe('UsageService', () => {
  let service: UsageService<UsageDto>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ],
    });
    service = TestBed.inject(UsageService<UsageDto>);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should group by substance and date', () => {
    let usages: UsageDto[] = [
      {id: 1, substance: 1, sentiment: 2, craving: 2, datetime: new Date('2024-01-01 10:10'), quantity: 2, trigger: [{name: "trigger 1"}]},
      {id: 2, substance: 1, sentiment: 4, craving: 4, datetime: new Date('2024-01-01 10:20'), quantity: 2, trigger: [{name: "trigger 1"}]},
      {id: 3, substance: 2, sentiment: 2, craving: 2, datetime: new Date('2024-01-01 10:20'), quantity: 2, trigger: [{name: "trigger 1"}]},
      {id: 4, substance: 2, sentiment: 4, craving: 4, datetime: new Date('2024-01-01 10:10'), quantity: 2, trigger: [{name: "trigger 1"}]},
    ];
    let grouped = service.goupByHour(usages);
    let date = new Date('2024-01-01 10:59:59');
    let substanceMap: Map<number, Map<Date, FinalUsage>> = new Map;
    let groupedMap: Map<Date, FinalUsage> = new Map;
    groupedMap.set(date, {quantity: 4, craving: 3, sentiment: 3, datetime: date, substance: 1});
    substanceMap.set(1, groupedMap);

    groupedMap = new Map;
    groupedMap.set(date, {quantity: 4, craving: 3, sentiment: 3, datetime: date, substance: 2});
    substanceMap.set(2, groupedMap);

    expect(grouped).toEqual(groupedMap);
  })
});

//let mp = new Map([{key: '', value: ''}]);