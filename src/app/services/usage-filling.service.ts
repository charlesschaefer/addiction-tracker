import { Injectable } from "@angular/core";
import { UsageFillingAddDto, UsageFillingDto, UsageFillings } from "../dto/usage-filling.dto";
import { ServiceAbstract } from "./service.abstract";
import { DbService } from "./db.service";
import { DatabaseChangeType } from "dexie-observable/api";
import { Changes, DataUpdatedService } from "./data-updated.service";

/**
 * Counts for alternative activity usage.
 */
export interface UsageFillingCounts {
    activity: number;
    count: number;
    successCount: number;
    failCount: number;
}

/**
 * Service for managing usage filling entries.
 */
@Injectable({
    providedIn: "root",
})
export class UsageFillingService extends ServiceAbstract<UsageFillings> {
    protected override storeName: "usage_filling" =
        "usage_filling";

    /**
     * Injects dependencies for usage filling logic.
     */
    constructor(
        protected override dbService: DbService,
        protected override dataUpdatedService: DataUpdatedService,
    ) {
        super();
        this.setTable();
    }

    /**
     * Adds a usage filling entry and notifies data update service.
     * @param usage Usage filling entry to add
     */
    override add(usage: UsageFillingAddDto) {
        return super.add(usage).then(() => {
            this.dataUpdatedService?.next([{
                key: 'id', 
                obj: usage,
                table: this.storeName,
                type: DatabaseChangeType.Create,
                source: ''
            }] as Changes[]);
        });
    }

    /**
     * Returns a map of alternative activity counts and success/fail stats.
     */
    getAlternativeActivityCounts(): Promise<Map<number, UsageFillingCounts>> {
        return this.list().then(fillings => {
            const counts: Map<number, UsageFillingCounts> = new Map();
            return fillings.reduce((prev, curr) => {
                if (!curr.alternative_activity || !(curr.alternative_activity > 0)) {
                    return counts;
                }
                if (counts.has(curr.alternative_activity as number)) {
                    const substanceCount = counts.get(curr.alternative_activity as number) as UsageFillingCounts;
                    
                    substanceCount.count += 1;
                    substanceCount.failCount    += curr.kept_usage ? 1 : 0;
                    substanceCount.successCount += curr.kept_usage ? 0 : 1;
                    counts.set(curr.alternative_activity as number, substanceCount);
                } else {
                    const count = {
                        activity: curr.alternative_activity as number,
                        count: 1, 
                        successCount: curr.kept_usage ? 0 : 1,
                        failCount: curr.kept_usage ? 1: 0
                    } as UsageFillingCounts;
                    counts.set(curr.alternative_activity as number, count);
                }

                return counts;
            }, counts);
        });
    }
}
