import { Injectable, Inject } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { AppDb } from '../app.db';
import { DateTime } from 'luxon';
import { UsageAddDto, UsageDto } from '../dto/usage.dto';
import { DbService } from './db.service';
import { DatabaseChangeType } from 'dexie-observable/api';
import { Changes, DataUpdatedService } from './data-updated.service';

export const DATE_FORMAT = 'yyyy-mm-dd HH:MM:ss';

/**
 * Used for grouping intermediate usage data before aggregation.
 */
export interface IntermediaryUsage {
    quantity: number[];
    craving: number[];
    sentiment: number[];
}

/**
 * Represents a finalized usage entry after aggregation.
 */
export interface FinalUsage {
    quantity: number;
    craving: number;
    sentiment: number;
    datetime: Date;
    substance: number;
};

type Usages = UsageAddDto | UsageDto;

@Injectable({
    providedIn: 'root'
})
export class UsageService extends ServiceAbstract<Usages> {
    protected override storeName: 'usage' = 'usage';

    sobrietyDaysCache?: number;
    usageHistoryCache?: UsageDto[];
    loadingHistory = false;

    /**
     * Injects dependencies for usage logic.
     */
    constructor(
        protected override dbService: DbService,
        protected override dataUpdatedService: DataUpdatedService,
    ) {
        super();
        this.setTable();
    }

    /**
     * Adds a usage entry and notifies data update service.
     * @param usage Usage entry to add
     */
    override add(usage: UsageAddDto) {
        return super.add(usage).then(async () => {
            console.log("Entrou no usage.add()")
            this.dataUpdatedService?.next([{
                key: 'id', 
                obj: usage,
                table: this.storeName,
                type: DatabaseChangeType.Create,
                source: ''
            }] as Changes[]);
            // Add cost to cost table if present
            if (usage.cost !== undefined) {
                // Assumes dbService has a method to add to the 'cost' table
                await this.dbService.dbService.table('cost').add({
                    substance: usage.substance,
                    cost: usage.cost,
                    datetime: usage.datetime
                });
            }
        })
    }

    /**
     * Groups usages by hour.
     * @param usages Array of usages
     */
    groupByHour(usages: Usages[]): Map<number, Map<string, FinalUsage>> {
        return this.groupBy(usages, 'hour');
    }

    /**
     * Groups usages by day.
     * @param usages Array of usages
     */
    groupByDay(usages: Usages[]): Map<number, Map<string, FinalUsage>> {
        return this.groupBy(usages, 'day');
    }

    /**
     * Groups usages by hour or day, aggregates values.
     * @param usages Array of usages
     * @param groupType "hour" or "day"
     */
    private groupBy(usages: Usages[], groupType: "hour" | "day"): Map<number, Map<string, FinalUsage>> {
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

    /**
     * Converts a grouped map of usages to an array of usage DTOs.
     * @param groupMap Grouped usage map
     */
    groupMapToUsages(groupMap: Map<number, Map<string, FinalUsage>>): Usages[] {
        const usageDtos: Usages[] = [];
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
                } as Usages);
            })
        });

        return usageDtos;
    }

    /**
     * Returns the most used trigger and its total quantity.
     * @param result Array of usages
     */
    getMostUsedTrigger(result: Usages[]): [string, number] {
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

    /**
     * Calculates the number of days since the last usage.
     * Uses cache if available.
     * @param usageHistory Optional usage history array
     * @param useCache Whether to use cached value
     */
    calculateSobrietyDays(usageHistory?: UsageDto[], useCache: boolean = true): number {
        if (useCache && this.sobrietyDaysCache) return this.sobrietyDaysCache;
        
        if (!usageHistory || !usageHistory.length) {
            if (!this.usageHistoryCache && !this.loadingHistory) {
                this.loadingHistory = true;
                this.list().then(usages => {
                    this.usageHistoryCache = usages as UsageDto[]
                    this.loadingHistory = false;
                });
                this.sobrietyDaysCache = 0;
                return 0;
            }
            usageHistory = (this.loadingHistory ? [] : this.usageHistoryCache) as UsageDto[];
        }

        const oldDate = new Date();
        oldDate.setFullYear(1980);
        const highestDate = usageHistory.reduce((prev, curr) => {
            const prevDate = DateTime.fromJSDate(prev);
            const currDate = DateTime.fromJSDate(curr.datetime);
            return DateTime.max(prevDate, currDate).toJSDate();
        }, oldDate);

        if (highestDate == oldDate) return 0;
        const sobrietyDays = Math.abs(Math.round(DateTime.fromJSDate(highestDate).diff(DateTime.now(), "days").days));
        this.sobrietyDaysCache = sobrietyDays;
        return sobrietyDays;
    }

    /**
     * Returns correlation between mood (sentiment) and craving.
     * @param usageHistory Array of usage entries
     * @param sentimentLabels Array of sentiment labels to include
     * @returns Array of { mood, avgCraving, count }
     */
    getMoodCravingCorrelation(
        usageHistory: UsageDto[],
        sentimentLabels: string[]
    ): { mood: string; avgCraving: number; count: number }[] {
        const result: { [mood: string]: { total: number; count: number } } = {};
        sentimentLabels.forEach(label => {
            result[label] = { total: 0, count: 0 };
        });
        usageHistory.forEach(entry => {
            const mood = entry.sentiment;
            if (mood && result[sentimentLabels[mood]] !== undefined && typeof entry.craving === "number") {
                result[sentimentLabels[mood]].total += entry.craving;
                result[sentimentLabels[mood]].count += 1;
            }
        });
        return sentimentLabels.map(mood => ({
            mood,
            avgCraving: result[mood].count > 0 ? result[mood].total / result[mood].count : 0,
            count: result[mood].count
        }));
    }

    /**
     * Returns correlation between trigger and craving.
     * @param usageHistory Array of usage entries
     * @param triggerLabels Array of trigger names to include
     * @returns Array of { trigger, avgCraving, count }
     */
    getTriggerCravingCorrelation(
        usageHistory: UsageDto[],
        triggerLabels: string[]
    ): { trigger: string; avgCraving: number; count: number }[] {
        const result: { [trigger: string]: { total: number; count: number } } = {};
        triggerLabels.forEach(label => {
            result[label] = { total: 0, count: 0 };
        });
        usageHistory.forEach(entry => {
            if (Array.isArray(entry.trigger)) {
                entry.trigger.forEach(trigger => {
                    if (trigger && result[trigger.name] !== undefined && typeof entry.craving === "number") {
                        result[trigger.name].total += entry.craving;
                        result[trigger.name].count += 1;
                    }
                });
            }
        });
        return triggerLabels.map(trigger => ({
            trigger,
            avgCraving: result[trigger].count > 0 ? result[trigger].total / result[trigger].count : 0,
            count: result[trigger].count
        }));
    }
}
