import { Injectable, Inject } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { TriggerAddDto, TriggerDto } from '../dto/trigger.dto';
import { AppDb } from '../app.db';
import { DbService } from './db.service';

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
    ) {
        super();
        this.setTable();
    }
}
