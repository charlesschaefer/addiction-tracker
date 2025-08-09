import { Injectable, inject } from "@angular/core";
import { DbService } from "./db.service";
import { ServiceAbstract } from "./service.abstract";
import { AlternativeActivityAddDto, AlternativeActivityDto } from "../dto/alternative-activity.dto";
import { TranslocoService } from "@jsverse/transloco";
import { PromiseExtended } from "dexie";

type AlternativeActivities = AlternativeActivityDto | AlternativeActivityAddDto;

/**
 * Service for managing alternative activities.
 */
@Injectable({
    providedIn: "root",
})
export class AlternativeActivityService extends ServiceAbstract<AlternativeActivities> {
    protected override dbService = inject(DbService);
    private translateService = inject(TranslocoService);

    protected override storeName = 'alternative_activity' as const;

    /**
     * Injects the database service and sets up the table.
     */
    constructor() {
        super();
        this.setTable();
    }

    override list(): PromiseExtended<AlternativeActivityDto[]> {
        return super.list().then(activities => {
            return activities.map(activity => ({
                ...activity,
                name: this.translateService.translate(activity.name)
            })) as AlternativeActivityDto[];
        })
    }
}
