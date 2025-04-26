import { Injectable, Inject } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { CostAddDto, CostDto } from '../dto/cost.dto';
import { AppDb } from '../app.db';
import { DbSchema } from 'dexie';
import { DbService } from './db.service';
import { Changes, DataUpdatedService } from './data-updated.service';
import { DatabaseChangeType } from 'dexie-observable/api';

type Costs = CostDto | CostAddDto;

@Injectable({
    providedIn: 'root'
})
export class CostService extends ServiceAbstract<Costs> {
    protected override storeName: 'cost' = 'cost';
    

    constructor(
        protected override dbService: DbService,
        protected dataUpdteService: DataUpdatedService
    ) {
        super();
        this.setTable();
    }

    override add(costs: CostAddDto) {
        return super.add(costs).then(() => {
            this.dataUpdatedService?.next([{
                key: 'id', 
                obj: costs,
                table: this.storeName,
                type: DatabaseChangeType.Create,
                source: ''
            }] as Changes[]);
        })
    }

    getTotalSpent() {
        return this.table.toArray().then(data => {
            return data.reduce((acc, item) => {    
                return acc + item.value;
            }, 0);
        });
    }

    getTotalSpentBySubstance(substanceId: number) {
        return this.table.where('substance').equals(substanceId).toArray().then(data => {
            data.reduce((acc, item) => {    
                return acc + item.value;
            }, 0);
        });
    }
}
