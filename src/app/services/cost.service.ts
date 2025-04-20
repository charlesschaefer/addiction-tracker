import { Injectable, Inject } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { CostAddDto, CostDto } from '../dto/cost.dto';
import { AppDb } from '../app.db';
import { DbSchema } from 'dexie';
import { DbService } from './db.service';

type Costs = CostDto | CostAddDto;

@Injectable({
    providedIn: 'root'
})
export class CostService extends ServiceAbstract<Costs> {
    protected override storeName: 'cost' = 'cost';
    protected override dbService: DbService;

    constructor(dbService: DbService) {
        super();
        this.setTable();
    }
}
