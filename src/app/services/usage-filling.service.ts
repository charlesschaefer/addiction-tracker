import { Injectable } from "@angular/core";
import { UsageFillingAddDto, UsageFillingDto, UsageFillings } from "../dto/usage-filling.dto";
import { ServiceAbstract } from "./service.abstract";
import { DbService } from "./db.service";
import { DatabaseChangeType } from "dexie-observable/api";
import { Changes, DataUpdatedService } from "./data-updated.service";

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
}
