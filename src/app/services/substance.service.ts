import { Injectable } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { SubstanceAddDto, SubstanceDto } from '../dto/substance.dto';
import { DbService } from './db.service';

export type Substance = SubstanceDto | SubstanceAddDto;

@Injectable({
    providedIn: 'root'
})
export class SubstanceService extends ServiceAbstract<Substance> {
    protected override storeName: 'substance' = 'substance';

    constructor(
        protected override dbService: DbService
    ) {
        super();
        this.setTable();
    }
}
