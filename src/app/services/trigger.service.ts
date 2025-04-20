import { Injectable, Inject } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { TriggerAddDto, TriggerDto } from '../dto/trigger.dto';
import { AppDb } from '../app.db';
import { DbService } from './db.service';

type Triggers = TriggerDto | TriggerAddDto;


@Injectable({
    providedIn: 'root'
})
export class TriggerService extends ServiceAbstract<Triggers> {
    protected override storeName: 'trigger' = 'trigger';
    protected override dbService: DbService;

    constructor(dbService: DbService) {
        super();
        this.setTable();
    }
}
