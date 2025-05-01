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
    prepareSpendingTrendData(usageHistory: UsageDto[]) {
        const spendingByDate: { [key: string]: number } = {};
        const dates: string[] = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            dates.push(dateStr);
            spendingByDate[dateStr] = 0;
        }
        usageHistory.forEach((entry) => {
            if (spendingByDate[entry.datetime.toISOString().split("T")[0]] !== undefined && entry.cost) {
                spendingByDate[entry.datetime.toISOString().split("T")[0]] += entry.cost;
            }
        });
        return dates.map((date) => ({
            date,
            spending: spendingByDate[date],
        }));
    }
    
}
