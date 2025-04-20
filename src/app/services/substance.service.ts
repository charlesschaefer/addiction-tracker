import { Injectable, Inject } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { SubstanceAddDto, SubstanceDto } from '../dto/substance.dto';
import { AppDb } from '../app.db';
import { DbService } from './db.service';

type Substances = SubstanceDto | SubstanceAddDto;

@Injectable({
    providedIn: 'root'
})
export class SubstanceService extends ServiceAbstract<Substances> {
    protected override storeName: 'substance' = 'substance';

    constructor(
        protected override dbService: DbService
    ) {
        super();
        this.setTable();
    }
}
