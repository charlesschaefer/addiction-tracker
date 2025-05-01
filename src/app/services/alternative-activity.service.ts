import { Injectable } from "@angular/core";
import { DbService } from "./db.service";
import { ServiceAbstract } from "./service.abstract";
import { AlternativeActivityAddDto, AlternativeActivityDto } from "../dto/alternative-activity.dto";
import { TableKeys } from "../app.db";

type AlternativeActivities = AlternativeActivityDto | AlternativeActivityAddDto;

/**
 * Service for managing alternative activities.
 */
@Injectable({
    providedIn: "root",
})
export class AlternativeActivityService extends ServiceAbstract<AlternativeActivities> {
    protected override storeName: 'alternative_activity' = 'alternative_activity';

    /**
     * Injects the database service and sets up the table.
     */
    constructor(
        protected override dbService: DbService
    ) {
        super();
        this.setTable();
    }
}
