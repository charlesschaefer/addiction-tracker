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
};

@Injectable({
    providedIn: 'root'
})
export class UsageService<T extends UsageAddDto> extends ServiceAbstract<T> {
    storeName = 'usage';

    goupByHour(usages: T[]): Map<Date, FinalUsage> {
        return this.groupBy(usages, 'hour');
    }

    groupByDay(usages: T[]): Map<Date, FinalUsage> {
        return this.groupBy(usages, 'day');
    }

    private groupBy(usages: T[], groupType: "hour" | "day"): Map<number, Map<Date, FinalUsage>> {
        let substance: Map<number, Map<Date, IntermediaryUsage>>;
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
                    sentiment: [usage.sentiment]
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
        let finalGroup = new Map;
        group.forEach((usage, hour) => {
            let newUsage: FinalUsage = {
                quantity: usage.quantity.reduce((prev, curr) => prev + curr, 0),
                craving: usage.craving.reduce((prev, curr) => curr + prev, 0) / usage.craving.length,
                sentiment: usage.sentiment.reduce((prev, curr) => curr + prev, 0) / usage.sentiment.length,
                datetime: hour
            };
            finalGroup.set(hour, newUsage);
        });

        return finalGroup;
    }
}
