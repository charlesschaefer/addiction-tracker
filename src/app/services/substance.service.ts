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

    /**
     * Gets all active (non-archived) substances.
     */
    getActiveSubstances(): Promise<SubstanceDto[]> {
        return this.table.toArray().then((substances) => {
            return substances.filter((substance: any) => !substance.archived || substance.archived === undefined || substance.archived === null || substance.archived === 0) as SubstanceDto[];
        });
    }

    /**
     * Archives a substance by setting archived to 1 and archive_date to current date.
     * @param id Substance ID to archive
     */
    async archiveSubstance(id: number): Promise<void> {
        const substance = await this.get(id) as SubstanceDto;
        if (substance) {
            substance.archived = 1;
            substance.archive_date = new Date();
            await this.edit(id, substance);
        }
    }

    /**
     * Unarchives a substance by setting archived to 0 and clearing archive_date.
     * @param id Substance ID to unarchive
     */
    async unarchiveSubstance(id: number): Promise<void> {
        const substance = await this.get(id) as SubstanceDto;
        if (substance) {
            substance.archived = 0;
            substance.archive_date = null;
            await this.edit(id, substance);
        }
    }

    /**
     * Gets all archived substances.
     */
    getArchivedSubstances(): Promise<SubstanceDto[]> {
        return this.table.toArray().then((substances) => {
            return substances.filter((substance: any) => substance.archived === 1) as SubstanceDto[];
        });
    }
}
