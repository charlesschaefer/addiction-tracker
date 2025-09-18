import { Injectable, inject } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { TriggerAddDto, TriggerDto } from '../dto/trigger.dto';
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
    protected override dbService = inject(DbService);
    private translateService = inject(TranslocoService);

    protected override storeName = 'trigger' as const;
    
    /**
     * Injects the database service and sets up the table.
     */
    constructor() {
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
        return this.getActiveTriggers().then(triggers => triggers.map(trigger => this.translateService.translate(trigger.name)));
    }

    /**
     * Gets all active (non-archived) triggers.
     */
    getActiveTriggers(): Promise<TriggerDto[]> {
        return this.table.toArray().then((triggers) => {
            return triggers
                .filter(
                    (trigger: any) => 
                        !trigger.archived || trigger.archived === undefined || trigger.archived === null || trigger.archived === 0
                ).map(trigger => ({
                    ...trigger,
                    name: this.translateService.translate(trigger.name)
                })) as TriggerDto[];
        });
    }

    /**
     * Archives a trigger by setting archived to 1 and archive_date to current date.
     * @param id Trigger ID to archive
     */
    async archiveTrigger(id: number): Promise<void> {
        const trigger = await this.get(id) as TriggerDto;
        if (trigger) {
            trigger.archived = 1;
            trigger.archive_date = new Date();
            await this.edit(id, trigger);
        }
    }

    /**
     * Unarchives a trigger by setting archived to 0 and clearing archive_date.
     * @param id Trigger ID to unarchive
     */
    async unarchiveTrigger(id: number): Promise<void> {
        const trigger = await this.get(id) as TriggerDto;
        if (trigger) {
            trigger.archived = 0;
            trigger.archive_date = null;
            await this.edit(id, trigger);
        }
    }

    /**
     * Gets all archived triggers.
     */
    getArchivedTriggers(): Promise<TriggerDto[]> {
        return this.table.toArray().then((triggers) => {
            return triggers.filter((trigger: any) => trigger.archived === 1) as TriggerDto[];
        });
    }
}
