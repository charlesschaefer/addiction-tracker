import { Injectable, Inject } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { TriggerAddDto, TriggerDto } from '../dto/trigger.dto';
import { AppDb } from '../app.db';
import { DbService } from './db.service';
import { TranslocoService } from '@jsverse/transloco';
import { PromiseExtended } from 'dexie';

type Triggers = TriggerDto | TriggerAddDto;

/**
 * Service for managing triggers.
 */
@Injectable({
    providedIn: 'root'
})
export class TriggerService extends ServiceAbstract<Triggers> {
    protected override storeName: 'trigger' = 'trigger';
    
    /**
     * Injects the database service and sets up the table.
     */
    constructor(
        protected override dbService: DbService,
        private translateService: TranslocoService,
    ) {
        super();
        this.setTable();
    }

    override list(): PromiseExtended<Triggers[]> {
        return super.list().then(triggers => {
            return triggers.map(trigger => ({
                ...trigger,
                name: this.translateService.translate(trigger.name)
            })) as Triggers[];
        })
    }

    /**
     * Returns all trigger labels (names).
     * In a real app, this could fetch from DB or config.
     */
    async getTriggerLabels(): Promise<string[]> {
        return this.list().then(triggers => triggers.map(trigger => this.translateService.translate(trigger.name)));
    }
}
