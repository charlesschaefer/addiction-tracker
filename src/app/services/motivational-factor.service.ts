import { Injectable } from "@angular/core";
import { ServiceAbstract } from "./service.abstract";
import { MotivationalFactorAddDto, MotivationalFactorDto } from "../dto/motivational-factor.dto";
import { DbService } from "./db.service";
import { DatabaseChangeType } from "dexie-observable/api";
import { Changes } from "./data-updated.service";

type MotivationalFactors = MotivationalFactorAddDto | MotivationalFactorDto;

/**
 * Service for managing motivational factors.
 */
@Injectable({
    providedIn: "root",
})
export class MotivationalFactorService extends ServiceAbstract<MotivationalFactors> {
    protected override storeName: 'motivational_factor' = 'motivational_factor';
    
    /**
     * Injects the database service and sets up the table.
     */
    constructor(
        protected override dbService: DbService
    ) {
        super();
        this.setTable();
    }

    /**
     * Adds a motivational factor and notifies data update service.
     * @param motivational_factor Motivational factor to add
     */
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

    /**
     * Gets motivational factors for a specific substance.
     * @param substanceId Substance ID
     */
    getSubstanceFactors(substanceId: number) {
        return this.table.where("substance").equals(substanceId).toArray();
    }
}
