import { Injectable } from "@angular/core";
import { UsageFillingAddDto, UsageFillingDto, UsageFillings } from "../dto/usage-filling.dto";
import { ServiceAbstract } from "./service.abstract";
import { DbService } from "./db.service";
import { DatabaseChangeType } from "dexie-observable/api";
import { Changes, DataUpdatedService } from "./data-updated.service";

export interface UsageFillingCounts {
    activity: number;
    count: number;
    successCount: number;
    failCount: number;
}

@Injectable({
    providedIn: "root",
})
export class UsageFillingService extends ServiceAbstract<UsageFillings> {
    protected override storeName: "usage_filling" =
        "usage_filling";

    constructor(
        protected override dbService: DbService,
        protected override dataUpdatedService: DataUpdatedService,
    ) {
        super();
        this.setTable();
    }

    override add(usage: UsageFillingAddDto) {
        return super.add(usage).then(() => {
            this.dataUpdatedService?.next([{
                key: 'id', 
                obj: usage,
                table: this.storeName,
                type: DatabaseChangeType.Create,
                source: ''
            }] as Changes[]);
        })
    }

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
        })
    }
}
