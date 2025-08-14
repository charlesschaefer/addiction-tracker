import { Dexie, Table, Transaction } from "dexie";
import { SubstanceDto } from "./dto/substance.dto";
import { UsageDto } from "./dto/usage.dto";
import { TriggerDto } from "./dto/trigger.dto";
import { CostDto } from "./dto/cost.dto";
import { RecommendationDto } from "./dto/recommendation.dto";
import { AlternativeActivityDto } from "./dto/alternative-activity.dto";
import { MotivationalFactorDto } from "./dto/motivational-factor.dto";
import { AchievementDto } from "./dto/achievement.dto";
import { AchievementData } from "./data/achievement.data";
import { AlternativeActivityData } from "./data/alternative-activity.data";
import { TriggerData } from "./data/trigger.data";

export type TableKeys =
    | "substance"
    | "usage"
    | "trigger"
    | "cost"
    | "recommendation"
    | "alternative_activity"
    | "motivational_factor"
    | "usage_filling"
    | "achievement";
export const DATABASE_NAME = "usage-control"; // 'addiction_tracker';

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
        console.log("Vamos adicionar as coisas aqui.");
        this.version(5).stores({
            substance: "++id, name",
            usage: "++id, substance, quantity, datetime, sentiment, craving, trigger",
            trigger: "++id, name",
            cost: "++id, substance, value, date",
            recommendation: "++id, trigger, text",
        });

        this.version(8)
            .stores({
                substance: "++id, name",
                usage: "++id, substance, quantity, datetime, sentiment, craving, trigger, cost",
                trigger: "++id, name",
                cost: "++id, substance, value, date",
                recommendation: "++id, trigger, text",
                motivational_factor:
                    "++id, substance, type, content, createdAt",
                usage_filling:
                    "++id, datetime, substance, motivational_factor, alternative_activity, kept_usage",
                alternative_activity: "++id, name, description, duration",
                achievement:
                    "++id, title, description, completed, category, icon",
            })
            .upgrade((transaction) => {
                console.log("Upgrade to version 8");
                try {
                    this.achievement
                        .bulkPut(AchievementData.data);
                    this.alternative_activity
                        .bulkPut(AlternativeActivityData.data);
                    this.updateTriggerDependents(transaction);
                    // this.trigger
                    //     .bulkPut(TriggerData.data);
                    console.log(
                        "Populated achievement, alternative_activity and trigger tables with initial data."
                    );
                } catch (error) {
                    transaction.abort();
                    console.error("Error during upgrade:", error);
                }
            });

        this.version(9)
            .stores({
                substance: "++id, name, archived, archive_date",
                usage: "++id, substance, quantity, datetime, sentiment, craving, trigger, cost",
                trigger: "++id, name",
                cost: "++id, substance, value, date",
                recommendation: "++id, trigger, text",
                motivational_factor:
                    "++id, substance, type, content, createdAt",
                usage_filling:
                    "++id, datetime, substance, motivational_factor, alternative_activity, kept_usage",
                alternative_activity: "++id, name, description, duration",
                achievement:
                    "++id, title, description, completed, category, icon",
            })
            .upgrade((transaction) => {
                console.log("Upgrade to version 9 - Adding archived fields to substance table");
                try {
                    // Add default values for existing substances
                    this.substance.toArray().then((substances) => {
                        const updatedSubstances = substances.map(substance => ({
                            ...substance,
                            archived: 0, // 0 for false, 1 for true
                            archive_date: null
                        }));
                        return this.substance.bulkPut(updatedSubstances);
                    });
                    console.log("Added archived fields to substance table");
                } catch (error) {
                    transaction.abort();
                    console.error("Error during upgrade:", error);
                }
            });

        this.version(10)
            .stores({
                trigger: "++id, name, archived, archive_date",
            })
            .upgrade((transaction) => {
                console.log("Upgrade to version 10 - Adding archived fields to trigger table");
                try {
                    // Add default values for existing substances
                    this.trigger.toArray().then((triggers) => {
                        const updatedTrigger = triggers.map(trigger => ({
                            ...trigger,
                            archived: 0, // 0 for false, 1 for true
                            archive_date: null
                        }));
                        return this.trigger.bulkPut(updatedTrigger);
                    });
                    console.log("Added archived fields to trigger table");
                } catch (error) {
                    transaction.abort();
                    console.error("Error during upgrade:", error);
                }
            });

        this.on("populate", (trans) => this.populate(trans));
    }

    populate(transaction: Transaction) {
        // on:populate is called when the database is created for the first time.
        // anyways we are calling the function to update trigger data

        this.achievement
            .bulkPut(AchievementData.data);
        this.alternative_activity
            .bulkPut(AlternativeActivityData.data);

        this.updateTriggerDependents(transaction);
        // this.trigger.bulkPut(TriggerData.data);

        console.log(
            "Populated achievement, alternative_activity and trigger tables with initial data."
        );
    }

    getTable(table: TableKeys) {
        return this[table];
    }

    updateTriggerDependents(_transaction: Transaction) {
        const triggerTable = this.trigger;
        triggerTable.toArray().then((triggers) => {
            if (triggers.length === 0) {
                console.log("Populating trigger table with initial data.");
                triggerTable.bulkPut(TriggerData.data);
                return;
            }

            const absentTriggers = TriggerData.data.filter(
                (triggerData) =>
                    !triggers.some((t) => t.name === triggerData.name)
            );

            if (absentTriggers.length == 0) {
                console.log("No new triggers to add to the database.");
                return;
            }

            // total of triggers we are going to add. So, a filter id=1
            // becomes id=3 if we add 2 triggers before it.
            const idSkip = TriggerData.data.length;

            // Map old trigger IDs to new trigger IDs
            const idMap = new Map<number, number>();
            const newTriggers = triggers.map((trigger) => {
                const newId = trigger.id + idSkip;
                idMap.set(trigger.id, newId);
                return { ...trigger, id: newId };
            });

            console.warn(
                "Trigger data found in the database. Trying to move the data without messing with it.",
                newTriggers, triggers
            );

            // Atualiza os triggers nas tabelas recommendation e usage
            // Atualiza recommendations
            this.recommendation
                .toCollection()
                .modify((rec) => {
                    if (rec.trigger && idMap.has(rec.trigger)) {
                        rec.trigger = idMap.get(rec.trigger) as number;
                    }
                    return true;
                });

            // Atualiza triggers em usage (array de triggers)
            this.usage
                .toCollection()
                .modify((usage) => {
                    if (Array.isArray(usage.trigger)) {
                        usage.trigger = usage.trigger.map((trg) => {
                            const triggerId = (trg as TriggerDto).id;
                            if (trg && triggerId && idMap.has(triggerId)) {
                                return { ...trg, id: idMap.get(triggerId)! };
                            }
                            return trg;
                        });
                    }
                    return true;
                });

            triggerTable.bulkPut([
                ...TriggerData.data,
                ...newTriggers
            ]);

            // @TODO: verificar se temos que fazer algo mais com os triggers ou se a atualização deles está funcionando
            // throw new Error("Check the file");
        });
    }
}
