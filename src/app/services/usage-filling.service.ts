import { Injectable } from "@angular/core";
import { UsageFillingDto } from "../dto/usage-filling.dto";
import { ServiceAbstract } from "./service.abstract";
import { DbService } from "./db.service";

@Injectable({
    providedIn: "root",
})
export class UsageFillingService extends ServiceAbstract<UsageFillingDto> {
    protected override storeName: "usage_filling" =
        "usage_filling";

    constructor(protected override dbService: DbService) {
        super();
        this.setTable();
    }
}
