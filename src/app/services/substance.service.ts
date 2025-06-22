import { Injectable } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { SubstanceAddDto, SubstanceDto } from '../dto/substance.dto';
import { DbService } from './db.service';

export type Substance = SubstanceDto | SubstanceAddDto;

/**
 * Service for managing substances.
 */
@Injectable({
    providedIn: 'root'
})
export class SubstanceService extends ServiceAbstract<Substance> {
    protected override storeName = 'substance' as const;

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
