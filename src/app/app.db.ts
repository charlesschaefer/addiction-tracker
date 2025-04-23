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

export type TableKeys = 'substance' | 'usage' | 'trigger' | 'cost' | 'recommendations' | 'alternative_activity' | 'motivational_factors' | 'usage_filling' | 'achievement';

export class AppDb extends Dexie {
    substance!: Table<SubstanceDto, number>;
    usage!: Table<UsageDto, number>;
    trigger!: Table<TriggerDto, number>;
    cost!: Table<CostDto, number>;
    recommendations!: Table<RecommendationDto, number>;
    alternative_activity!: Table<AlternativeActivityDto, number>;
    motivational_factors!: Table<MotivationalFactorDto, number>;
    usage_filling!: Table<UsageDto, number>;
    achievement!: Table<AchievementDto, number>;

    constructor() {
        super('addiction_tracker');
        console.log("Vamos adicionar as coisas aqui.")
        this.version(5).stores({
            substance: '++id, name',
            usage: '++id, substance, quantity, datetime, sentiment, craving, trigger',
            trigger: '++id, name',
            cost: '++id, substance, value, date',
            recommendations: '++id, trigger, text'
        });

        this.version(6).stores({
            substance: '++id, name',
            usage: '++id, substance, quantity, datetime, sentiment, craving, trigger',
            trigger: '++id, name',
            cost: '++id, substance, value, date',
            recommendations: '++id, trigger, text',
            motivational_factors: '++id, substance, type, content, createdAt',
            usage_filling: '++id, datetime, substance, motivational_factor, alternative_activity, kept_usage',
            alternative_activity: '++id, name, description, duration',
            achievement: '++id, title, description, completed, category, icon',
        }).upgrade(transaction => {
            console.log("Upgrade to version 6");
            try {
                transaction.table<AchievementDto, number>('achievement').bulkPut(AchievementData.data);
                transaction.table<AlternativeActivityDto, number>('alternative_activity').bulkPut(AlternativeActivityData.data);
                transaction.table<TriggerDto, number>('trigger').bulkPut(TriggerData.data);
                console.log("Populated achievement, alternative_activity and trigger tables with initial data.");
            } catch (error) {
                transaction.abort();
                console.error('Error during upgrade:', error);
            }
        });

        this.on('populate', () => this.populate() );
    }

    populate() {
        this.achievement.bulkPut(AchievementData.data);
        this.alternative_activity.bulkPut(AlternativeActivityData.data);
        this.trigger.bulkPut(TriggerData.data);
        console.log("Populated achievement, alternative_activity and trigger tables with initial data.");
    }

    getTable(table: TableKeys) {
        return this[table];
    }
}
