import { Injectable, Inject } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { CostAddDto, CostDto } from '../dto/cost.dto';
import { AppDb } from '../app.db';
import { DbSchema } from 'dexie';
import { DbService } from './db.service';
import { Changes, DataUpdatedService } from './data-updated.service';
import { DatabaseChangeType } from 'dexie-observable/api';
import { UsageDto } from '../dto/usage.dto';
import { SubstanceDto } from '../dto/substance.dto';

type Costs = CostDto | CostAddDto;

/**
 * Service for managing cost entries and calculations.
 */
@Injectable({
    providedIn: 'root'
})
export class CostService extends ServiceAbstract<Costs> {
    protected override storeName: 'cost' = 'cost';
    
    /**
     * Injects dependencies for cost logic.
     */
    constructor(
        protected override dbService: DbService,
        protected override dataUpdatedService: DataUpdatedService,
    ) {
        super();
        this.setTable();
    }

    /**
     * Adds a cost entry and notifies data update service.
     * @param costs Cost entry to add
     */
    override add(costs: CostAddDto) {
        return super.add(costs).then(() => {
            this.dataUpdatedService?.next([{
                key: 'id', 
                obj: costs,
                table: this.storeName,
                type: DatabaseChangeType.Create,
                source: ''
            }] as Changes[]);
        });
    }

    /**
     * Returns the total spent across all costs.
     */
    getTotalSpent() {
        return this.table.toArray().then(data => {
            return data.reduce((acc, item) => {    
                return acc + item.value;
            }, 0);
        });
    }

    /**
     * Returns the total spent for a specific substance.
     * @param substanceId Substance ID
     */
    getTotalSpentBySubstance(substanceId: number) {
        return this.table.where('substance').equals(substanceId).toArray().then(data => {
            data.reduce((acc, item) => {    
                return acc + item.value;
            }, 0);
        });
    }

    /**
     * Prepares cost data grouped by substance for visualization.
     * @param usageHistory Usage history array
     * @param substances Map of substance IDs to substance DTOs
     */
    prepareCostBySubstanceData(usageHistory: UsageDto[], substances: Map<number, SubstanceDto>) {
        const substanceCosts: { [key: string]: number } = {};
        usageHistory.forEach((entry) => {
            const substanceName = substances.get(entry.substance)?.name as string;
            if (entry.cost) {
                if (substanceCosts[substanceName]) {
                    substanceCosts[substanceName] += entry.cost;
                } else {
                    substanceCosts[substanceName] = entry.cost;
                }
            }
        });
        return Object.keys(substanceCosts).map((substance) => ({
            name: substance,
            value: substanceCosts[substance],
        }));
    }

    /**
     * Calculates total spending from usage history.
     * @param usageHistory Usage history array
     */
    calculateTotalSpending(usageHistory: UsageDto[]): number {
        return usageHistory.reduce((total, entry) => total + (entry.cost || 0), 0);
    }

    /**
     * Calculates spending for a given period.
     * @param usageHistory Usage history array
     * @param period Time period ("week", "month", "year", "all")
     */
    calculateSpendingByPeriod(usageHistory: UsageDto[], period: "week" | "month" | "year" | "all" = "all"): number {
        const now = new Date();
        let startDate: Date;
        switch (period) {
            case "week":
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case "month":
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 1);
                break;
            case "year":
                startDate = new Date(now);
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate = new Date(0);
        }
        return usageHistory
            .filter((entry) => new Date(entry.datetime) >= startDate)
            .reduce((total, entry) => total + (entry.cost || 0), 0);
    }

    /**
     * Projects annual spending based on monthly average.
     * @param usageHistory Usage history array
     */
    projectAnnualSpending(usageHistory: UsageDto[]): number {
        const monthlySpending = this.calculateSpendingByPeriod(usageHistory, "month");
        return monthlySpending * 12;
    }

    /**
     * Calculates potential savings over a number of years.
     * @param usageHistory Usage history array
     * @param years Number of years
     */
    calculatePotentialSavings(usageHistory: UsageDto[], years: number): number {
        const annualSpending = this.projectAnnualSpending(usageHistory);
        return annualSpending * years;
    }

    /**
     * Calculates investment growth with annual savings and interest.
     * @param usageHistory Usage history array
     * @param years Number of years
     * @param interestRate Annual interest rate (default 7%)
     */
    calculateInvestmentGrowth(usageHistory: UsageDto[], years: number, interestRate = 0.07): number {
        const annualSavings = this.projectAnnualSpending(usageHistory);
        let total = 0;
        for (let i = 0; i < years; i++) {
            total = (total + annualSavings) * (1 + interestRate);
        }
        return total;
    }

    /**
     * Prepares daily spending trend data for the last 30 days.
     * @param usageHistory Usage history array
     */
    async prepareSpendingTrendData(usageHistory: UsageDto[]) {
        const spendingByDate: Map<string, number> = new Map();
        const costByDate: Map<string, number> = new Map();
        const dates: string[] = [];
        const today = new Date();
        const substances = usageHistory.reduce((acc, curr) => {
            if (!acc.some((substance) => substance == curr.substance)) {
                acc.push(curr.substance);
            }
            return acc;
        }, [] as number[]);

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            dates.push(dateStr);
            spendingByDate.set(dateStr, 0);
        }
        usageHistory.forEach((entry) => {
            if (spendingByDate.has(entry.datetime.toISOString().split("T")[0]) && entry.cost) {
                spendingByDate.set(entry.datetime.toISOString().split("T")[0], entry.cost);
            }
        });

        const substanceCosts: Map<number, Map<string, number>> = new Map();
        for (let substance of substances) {
            const cost = await this.getCostBySubstanceAndDate(substance, dates)
             substanceCosts.set(substance, cost);
        }

        const finalCosts = new Map<String, number>();
        Array.from(spendingByDate.keys()).forEach((date: string) => {
            finalCosts.set(date, Array.from(substanceCosts.values()).reduce((acc, curr) => {
                return acc + (curr.get(date) || 0);
            }, 0));
        });

        return dates.map((date) => ({
            date,
            spending: finalCosts.get(date) ?? spendingByDate.get(date),
        }));
    }
    
    /**
     * Prepares cost data for a specific substance and date list.
     * 
     * @param substanceId Substance ID
     * @param date Array of date strings in YYYY-MM-DD format
     */
    getCostBySubstanceAndDate(substanceId: number, date: string[]): Promise<Map<string, number>> {
        return this.table
            .where('substance')
            .equals(substanceId)
            .filter((cost) => date.includes(cost.date.toISOString().split("T")[0]))
            .toArray()
            .then((data) => {
                const costByDate = new Map<string, number>();
                return data.reduce((prev, curr) => {
                    const dateStr = curr.date.toISOString().split("T")[0];
                    if (prev.has(dateStr)) {
                        prev.set(dateStr, prev.get(dateStr)! + curr.value);
                    } else {
                        prev.set(dateStr, curr.value);
                    }
                    return prev;
                }, costByDate);
            });
    }
}
