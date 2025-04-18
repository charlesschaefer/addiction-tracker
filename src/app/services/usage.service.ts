import { Injectable } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { DateTime } from 'luxon';
import { UsageAddDto, UsageDto } from '../dto/usage.dto';

export const DATE_FORMAT = 'yyyy-mm-dd HH:MM:ss';

export interface IntermediaryUsage {
    quantity: number[];
    craving: number[];
    sentiment: number[];
}

export interface FinalUsage {
    quantity: number;
    craving: number;
    sentiment: number;
    datetime: Date;
    substance: number;
};

@Injectable({
    providedIn: 'root'
})
export class UsageService<T extends UsageAddDto> extends ServiceAbstract<T> {
    storeName = 'usage';

    groupByHour(usages: T[]): Map<number, Map<string, FinalUsage>> {
        return this.groupBy(usages, 'hour');
    }

    groupByDay(usages: T[]): Map<number, Map<string, FinalUsage>> {
        return this.groupBy(usages, 'day');
    }

    private groupBy(usages: T[], groupType: "hour" | "day"): Map<number, Map<string, FinalUsage>> {
        const substance = new Map<number, Map<string, IntermediaryUsage>>();
        // create a map with data vectors, without calculating yet
        usages.forEach(usage => {
            const hour = DateTime.fromJSDate(usage.datetime).endOf(groupType).toFormat(DATE_FORMAT);
            if (!substance.has(usage.substance)) {
                const group = new Map<string, IntermediaryUsage>();
                substance.set(usage.substance, group);
            }
            const group = substance.get(usage.substance);
            if (!group?.has(hour)) {
                group?.set(hour, {
                    quantity: [usage.quantity],
                    craving: [usage.craving],
                    sentiment: [usage.sentiment],
                });
                substance.set(usage.substance, group as Map<string, IntermediaryUsage>);
                return;
            }
            
            
            const previousUsage = group.get(hour);
            previousUsage?.quantity.push(usage.quantity);
            previousUsage?.craving.push(usage.craving);
            previousUsage?.sentiment.push(usage.sentiment);
            group.set(hour, previousUsage as IntermediaryUsage);
            substance.set(usage.substance, group);
        });


        // calculates averages and sums of data
        const finalGroup = new Map<number, Map<string, FinalUsage>>();
        substance.forEach((usage, substanceId) => {
            if (!finalGroup.has(substanceId)) {
                finalGroup.set(substanceId, new Map);
            }
            usage.forEach((intermediary, hour) => {
                const newUsage: FinalUsage = {
                    quantity: intermediary.quantity.reduce((prev, curr) => prev + curr, 0),
                    craving: Math.round(intermediary.craving.reduce((prev, curr) => curr + prev, 0) / intermediary.craving.length),
                    sentiment: Math.round(intermediary.sentiment.reduce((prev, curr) => curr + prev, 0) / intermediary.sentiment.length),
                    datetime: DateTime.fromFormat(hour, DATE_FORMAT).toJSDate(),
                    substance: substanceId
                };
                const group = finalGroup.get(substanceId);
                group?.set(hour, newUsage);
                finalGroup.set(substanceId, group as Map<string, FinalUsage>);
            });
        });

        return finalGroup;
    }

    groupMapToUsageDto(groupMap: Map<number, Map<string, FinalUsage>>): UsageDto[] {
        const usageDtos: UsageDto[] = [];
        groupMap.forEach((usages) => {
            usages.forEach((finalUsage) => {
                usageDtos.push({
                    id: Math.random(),
                    craving: finalUsage.craving,
                    datetime: finalUsage.datetime,
                    quantity: finalUsage.quantity,
                    sentiment: finalUsage.sentiment,
                    substance: finalUsage.substance,
                    trigger: []
                } as UsageDto);
            })
        });

        return usageDtos;
    }

    getMostUsedTrigger(result: UsageDto[]): [string, number] {
        let usageTriggers = new Map<string, number>();
        result.forEach(usage => {
            usage.trigger?.forEach(trigger => {
                if (!usageTriggers.has(trigger.name)) {
                    usageTriggers.set(trigger.name, 0);
                }
                usageTriggers.set(trigger.name, usageTriggers.get(trigger.name) as number + usage.quantity);
            });
        });

        usageTriggers = new Map([...usageTriggers.entries()].sort((a, b) => a[1] <= b[1] ? 1 : -1));

        return usageTriggers.entries().next().value as [string, number];
    }
}
