import { Injectable } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { DateTime } from 'luxon';
import { UsageAddDto, UsageDto } from '../dto/usage.dto';
import { UsageAddComponent } from '../usage-add/usage-add.component';

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

    goupByHour(usages: T[]): Map<number, Map<Date, FinalUsage>> {
        return this.groupBy(usages, 'hour');
    }

    groupByDay(usages: T[]): Map<number, Map<Date, FinalUsage>> {
        return this.groupBy(usages, 'day');
    }

    private groupBy(usages: T[], groupType: "hour" | "day"): Map<number, Map<Date, FinalUsage>> {
        let substance: Map<number, Map<Date, IntermediaryUsage>> = new Map();
        // create a map with data vectors, without calculating yet
        usages.forEach(usage => {
            let hour = DateTime.fromJSDate(usage.datetime).endOf(groupType).toJSDate();
            if (!substance.has(usage.substance)) {
                let group: Map<Date, IntermediaryUsage> = new Map;
                substance.set(usage.substance, group);
            }
            let group = substance.get(usage.substance);
            if (!group?.has(hour)) {
                group?.set(hour, {
                    quantity: [usage.quantity],
                    craving: [usage.craving],
                    sentiment: [usage.sentiment],
                });
                substance.set(usage.substance, group as Map<Date, IntermediaryUsage>);
                return;
            }
            
            
            let previousUsage = group.get(hour);
            previousUsage?.quantity.push(usage.quantity);
            previousUsage?.craving.push(usage.craving);
            previousUsage?.sentiment.push(usage.sentiment);
            group.set(hour, previousUsage as IntermediaryUsage);
            substance.set(usage.substance, group);
        });


        // calculates averages and sums of data
        let finalGroup: Map<number, Map<Date, FinalUsage>> = new Map;
        substance.forEach((usage, substanceId) => {
            if (!finalGroup.has(substanceId)) {
                finalGroup.set(substanceId, new Map);
            }
            usage.forEach((intermediary, hour) => {
                let newUsage: FinalUsage = {
                    quantity: intermediary.quantity.reduce((prev, curr) => prev + curr, 0),
                    craving: intermediary.craving.reduce((prev, curr) => curr + prev, 0) / intermediary.craving.length,
                    sentiment: intermediary.sentiment.reduce((prev, curr) => curr + prev, 0) / intermediary.sentiment.length,
                    datetime: hour,
                    substance: substanceId
                };

                finalGroup.get(substanceId)?.set(hour, newUsage);
            });
        });

        return finalGroup;
    }
}
