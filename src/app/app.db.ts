import { Dexie, Table, Transaction } from 'dexie';
import { SubstanceDto } from './dto/substance.dto';
import { UsageDto } from './dto/usage.dto';
import { TriggerDto } from './dto/trigger.dto';
import { CostDto } from './dto/cost.dto';
import { RecommendationDto } from './dto/recommendation.dto';
import { AlternativeActivityDto } from './dto/alternative-activity.dto';
import { MotivationalFactorDto } from './dto/motivational-factor.dto';
import { AchievementDto } from './dto/achievement.dto';
import { AchievementData } from './data/achievement.data';
import { AlternativeActivityData } from './data/alternative-activity.data';
import { TriggerData } from './data/trigger.data';
import { trigger } from '@angular/animations';

export type TableKeys = 'substance' | 'usage' | 'trigger' | 'cost' | 'recommendation' | 'alternative_activity' | 'motivational_factor' | 'usage_filling' | 'achievement';
export const DATABASE_NAME = 'addiction_tracker';

export class AppDb extends Dexie {
    substance!: Table<SubstanceDto, number>;
    usage!: Table<UsageDto, number>;
    trigger!: Table<TriggerDto, number>;
    cost!: Table<CostDto, number>;
    recommendation!: Table<RecommendationDto, number>;
    alternative_activity!: Table<AlternativeActivityDto, number>;
    motivational_factor!: Table<MotivationalFactorDto, number>;
    usage_filling!: Table<UsageDto, number>;
    achievement!: Table<AchievementDto, number>;

    constructor() {
        super(DATABASE_NAME);
        console.log("Vamos adicionar as coisas aqui.")
        this.version(5).stores({
            substance: '++id, name',
            usage: '++id, substance, quantity, datetime, sentiment, craving, trigger',
            trigger: '++id, name',
            cost: '++id, substance, value, date',
            recommendation: '++id, trigger, text'
        });

        this.version(6).stores({
            substance: '++id, name',
            usage: '++id, substance, quantity, datetime, sentiment, craving, trigger, cost',
            trigger: '++id, name',
            cost: '++id, substance, value, date',
            recommendation: '++id, trigger, text',
            motivational_factor: '++id, substance, type, content, createdAt',
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

    updateTriggerDependents(transaction: Transaction) {
        this.trigger.toArray().then((triggers) => {
            if (triggers.length === 0) {
                console.log("Populating trigger table with initial data.");
                this.trigger.bulkPut(TriggerData.data);
                return;
            }

            const absentTriggers = TriggerData.data.filter((trigger) => !triggers.some((t) => t.name === trigger.name));

            if (absentTriggers.length == 0) {
                console.log("No new triggers to add to the database.");
                return;
            }

            // total of triggers we are going to add. So, a filter id=1 
            // becomes id=3 if we add 2 triggers before it.
            const idSkip = AlternativeActivityData.data.length;

            const newTriggers = triggers.map((trigger) => ({...trigger, id: trigger.id + idSkip }));

            console.warn("Trigger data found in the database. Trying to move the data without messing with it.");
            triggers.forEach((trigger, index) => {
                // updates trigger ids for recommendations
                this.recommendation.where({ trigger: trigger.id}).modify({ trigger:  newTriggers[index].id });
                // updates trigger ids for usage
                this.usage
                    .toCollection()
                    .modify((usage) => {
                        usage.trigger = usage.trigger?.map((trigger) => {
                            let newTrigger = trigger as TriggerDto;
                            newTrigger.id = newTrigger.id + idSkip;
                            return newTrigger
                        }) as TriggerDto[];
                    });
            });
            // @TODO: verificar se temos que fazer algo mais com os triggers ou se a atualização deles está funcionando
            throw new Error("Check the file");
        })
    }
}


