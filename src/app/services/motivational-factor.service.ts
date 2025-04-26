import { Injectable } from "@angular/core";
import { ServiceAbstract } from "./service.abstract";
import { MotivationalFactorAddDto, MotivationalFactorDto } from "../dto/motivational-factor.dto";
import { TableKeys } from "../app.db";
import { DbService } from "./db.service";
import { DatabaseChangeType } from "dexie-observable/api";
import { Changes } from "./data-updated.service";

type MotivationalFactors = MotivationalFactorAddDto | MotivationalFactorDto;

@Injectable({
    providedIn: "root",
})
export class MotivationalFactorService extends ServiceAbstract<MotivationalFactors> {
    protected override storeName: 'motivational_factor' = 'motivational_factor';
    
    constructor(
        protected override dbService: DbService
    ) {
        super();
        this.setTable();
    }

    override add(motivational_factor: MotivationalFactorAddDto) {
        return super.add(motivational_factor).then(() => {
            this.dataUpdatedService?.next([{
                key: 'id', 
                obj: motivational_factor,
                table: this.storeName,
                type: DatabaseChangeType.Create,
                source: ''
            }] as Changes[]);
        })
    }

    getSubstanceFactors(substanceId: number) {
        return this.table.where("substance").equals(substanceId).toArray();
    }
}
