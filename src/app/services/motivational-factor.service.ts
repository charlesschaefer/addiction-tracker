import { Injectable } from "@angular/core";
import { ServiceAbstract } from "./service.abstract";
import { MotivationalFactorAddDto, MotivationalFactorDto } from "../dto/motivational-factor.dto";
import { TableKeys } from "../app.db";
import { DbService } from "./db.service";

type MotivationalFactors = MotivationalFactorAddDto | MotivationalFactorDto;

@Injectable({
    providedIn: "root",
})
export class MotivationalFactorService extends ServiceAbstract<MotivationalFactors> {
    protected override storeName: 'motivational_factors' = 'motivational_factors';
    
    constructor(
        protected override dbService: DbService
    ) {
        super();
        this.setTable();
    }

    getSubstanceFactors(substanceId: number) {
        return this.table.where("substance").equals(substanceId).toArray();
    }
}
