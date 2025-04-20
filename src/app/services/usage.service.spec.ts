import { TestBed } from '@angular/core/testing';
import { NgxIndexedDBModule } from "ngx-indexed-db";
import { importProvidersFrom } from '@angular/core';
import { dbConfig } from "../db.config";

import { FinalUsage, UsageService, DATE_FORMAT } from './usage.service';
import { UsageDto } from '../dto/usage.dto';
import { DateTime } from 'luxon';

describe('UsageService', () => {
  let service: UsageService;
  let usages: UsageDto[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig))
      ],
    });
    service = TestBed.inject(UsageService);

    usages = [
      {id: 1, substance: 1, sentiment: 2, craving: 2, datetime: new Date('2024-01-01 10:10'), quantity: 2, trigger: [{name: "trigger 1"}]},
      {id: 2, substance: 1, sentiment: 4, craving: 4, datetime: new Date('2024-01-01 10:20'), quantity: 2, trigger: [{name: "trigger 1"}]},
      {id: 3, substance: 1, sentiment: 2, craving: 2, datetime: new Date('2024-01-01 11:20'), quantity: 2, trigger: [{name: "trigger 1"}]},
      {id: 4, substance: 2, sentiment: 2, craving: 2, datetime: new Date('2024-01-01 10:20'), quantity: 2, trigger: [{name: "trigger 1"}]},
      {id: 5, substance: 2, sentiment: 4, craving: 4, datetime: new Date('2024-01-01 10:10'), quantity: 2, trigger: [{name: "trigger 1"}]},
      {id: 6, substance: 2, sentiment: 2, craving: 2, datetime: new Date('2024-01-01 11:20'), quantity: 2, trigger: [{name: "trigger 1"}]},
    ];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should group by substance and hour', () => {
    const grouped = service.groupByHour(usages);
    const date1 = new Date('2024-01-01 10:59:59');
    const substanceMap = new Map<number, Map<string, FinalUsage>>();
    let groupedMap = new Map<string, FinalUsage>();
    groupedMap.set(DateTime.fromJSDate(date1).toFormat(DATE_FORMAT), {quantity: 4, craving: 3, sentiment: 3, datetime: date1, substance: 1});

    const date2 = new Date('2024-01-01 11:59:59');
    groupedMap.set(DateTime.fromJSDate(date2).toFormat(DATE_FORMAT), {quantity: 2, craving: 2, sentiment: 2, datetime: date2, substance: 1});

    substanceMap.set(1, groupedMap);

    groupedMap = new Map;
    groupedMap.set(DateTime.fromJSDate(date1).toFormat(DATE_FORMAT), {quantity: 4, craving: 3, sentiment: 3, datetime: date1, substance: 2});
    groupedMap.set(DateTime.fromJSDate(date2).toFormat(DATE_FORMAT), {quantity: 2, craving: 2, sentiment: 2, datetime: date2, substance: 2});
    substanceMap.set(2, groupedMap);

    expect(grouped).toEqual(substanceMap);
  });

  it('should group by substance and day', () => {
    const grouped = service.groupByDay(usages);
    const date = new Date('2024-01-01 23:59:59');
    const substanceMap = new Map<number, Map<string, FinalUsage>>();
    let groupedMap = new Map<string, FinalUsage>();
    groupedMap.set(DateTime.fromJSDate(date).toFormat(DATE_FORMAT), {quantity: 6, craving: 3, sentiment: 3, datetime: date, substance: 1});
    substanceMap.set(1, groupedMap);

    groupedMap = new Map;
    groupedMap.set(DateTime.fromJSDate(date).toFormat(DATE_FORMAT), {quantity: 6, craving: 3, sentiment: 3, datetime: date, substance: 2});
    substanceMap.set(2, groupedMap);

    expect(grouped).toEqual(substanceMap);
  })
});

//let mp = new Map([{key: '', value: ''}]);
