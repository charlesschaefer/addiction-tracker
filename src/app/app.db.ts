import { Dexie, Table } from 'dexie';
import { SubstanceDto } from './dto/substance.dto';
import { UsageDto } from './dto/usage.dto';
import { TriggerDto } from './dto/trigger.dto';
import { CostDto } from './dto/cost.dto';
import { RecommendationDto } from './dto/recommendation.dto';

export type TableKeys = 'substance' | 'usage' | 'trigger' | 'cost' | 'recommendations';

export class AppDb extends Dexie {
    substance!: Table<SubstanceDto, number>;
    usage!: Table<UsageDto, number>;
    trigger!: Table<TriggerDto, number>;
    cost!: Table<CostDto, number>;
    recommendations!: Table<RecommendationDto, number>;

    constructor() {
        super('addiction_tracker');
        this.version(5).stores({
            substance: '++id, name',
            usage: '++id, substance, quantity, datetime, sentiment, craving, trigger',
            trigger: '++id, name',
            cost: '++id, substance, value, date',
            recommendations: '++id, trigger, text'
        });
    }

    getTable(table: TableKeys) {
        return this[table];
    }
}
