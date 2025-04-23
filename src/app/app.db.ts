import { Dexie, Table } from 'dexie';
import { SubstanceDto } from './dto/substance.dto';
import { UsageDto } from './dto/usage.dto';
import { TriggerDto } from './dto/trigger.dto';
import { CostDto } from './dto/cost.dto';
import { RecommendationDto } from './dto/recommendation.dto';
import { AlternativeActivityDto } from './dto/alternative-activity.dto';
import { MotivationalFactorDto } from './dto/motivational-factor.dto';
import { AchievementDto } from './dto/achievement.dto';
import { AchievementData } from './data/achievements.data';
import { AlternativeActivityData } from './data/alternative-activity.data';
import { TriggerData } from './data/trigger.data';

export type TableKeys = 'substance' | 'usage' | 'trigger' | 'cost' | 'recommendations' | 'alternative_activity' | 'motivational_factors' | 'usage_filling';

export class AppDb extends Dexie {
    substance!: Table<SubstanceDto, number>;
    usage!: Table<UsageDto, number>;
    trigger!: Table<TriggerDto, number>;
    cost!: Table<CostDto, number>;
    recommendations!: Table<RecommendationDto, number>;
    alternative_activity!: Table<AlternativeActivityDto, number>;
    motivational_factors!: Table<MotivationalFactorDto, number>;
    usage_filling!: Table<UsageDto, number>;

    constructor() {
        super('addiction_tracker');
        this.version(5).stores({
            substance: '++id, name',
            usage: '++id, substance, quantity, datetime, sentiment, craving, trigger',
            trigger: '++id, name',
            cost: '++id, substance, value, date',
            recommendations: '++id, trigger, text'
        });

        this.version(6).stores({
            usage_filling: '++id, datetime, substance, motivational_factor, alternative_activity, kept_usage',
            alternative_activity: '++id, name, description, duration',
            achievement: '++id, title, description, completed, category, icon',
        }).upgrade(transaction => {
            try {
                transaction.table<AchievementDto, number>('achievement').bulkPut(AchievementData.data);
                transaction.table<AlternativeActivityDto, number>('alternative_activity').bulkPut(AlternativeActivityData.data);
                transaction.table<TriggerDto, number>('trigger').bulkPut(TriggerData.data);
            } catch (error) {
                console.error('Error during upgrade:', error);
            }
        });
    }

    protected populate() {

    }

    getTable(table: TableKeys) {
        return this[table];
    }
}
