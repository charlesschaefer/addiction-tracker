import { Injectable, inject } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { CostAddDto, CostDto } from '../dto/cost.dto';
import { DbService } from './db.service';
import { Changes, DataUpdatedService } from './data-updated.service';
import { DatabaseChangeType } from 'dexie-observable/api';
import { UsageDto } from '../dto/usage.dto';
import { SubstanceDto } from '../dto/substance.dto';
import { SubstanceService } from './substance.service';

type Costs = CostDto | CostAddDto;

/**
 * Service for managing cost entries and calculations.
 */
@Injectable({
    providedIn: 'root'
})
export class CostService extends ServiceAbstract<Costs> {
    protected override dbService = inject(DbService);
    protected override dataUpdatedService = inject(DataUpdatedService);
    private substanceService = inject(SubstanceService);

    protected override storeName = 'cost' as const;
    
    /**
     * Injects dependencies for cost logic.
     */
    constructor() {
        super();
        this.setTable();
    }

    /**
     * Lists all cost entries for active substances only.
     * @returns Promise<CostDto[]> Array of cost entries for active substances
     */
    async listActive(): Promise<CostDto[]> {
        const [allCosts, activeSubstances] = await Promise.all([
            this.list(),
            this.substanceService.getActiveSubstances()
        ]);
        
        const activeSubstanceIds = activeSubstances.map(substance => substance.id);
        const _return = (allCosts as CostDto[]).filter(cost => 
            activeSubstanceIds.includes(cost.substance)
        );
        return _return;
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
        //return this.table.toArray().then(data => {
        return this.listActive().then(data => {
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
        const substanceCosts: Record<string, number> = {};
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
        const spendingByDate = new Map<string, number>();
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

        const substanceCosts = new Map<number, Map<string, number>>();
        for (const substance of substances) {
            const cost = await this.getCostBySubstanceAndDate(substance, dates)
             substanceCosts.set(substance, cost);
        }

        const finalCosts = new Map<string, number>();
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

    // --- NEW METHODS USING COST TABLE DATA ---

    /**
     * Prepares cost data grouped by substance for visualization, using cost table.
     * @param costs Array of cost entries
     * @param substances Map of substance IDs to substance DTOs
     */
    prepareCostBySubstanceDataFromCosts(costs: any[], substances: Map<number, SubstanceDto>) {
        const substanceCosts: Record<string, number> = {};
        if (!substances) return [];
        costs.forEach((entry) => {
            if (!entry.substance) return;
            if (!substances.has(entry.substance)) return;
            const substanceName = substances.get(entry.substance)?.name as string;
            if (entry.value) {
                if (substanceCosts[substanceName]) {
                    substanceCosts[substanceName] += entry.value;
                } else {
                    substanceCosts[substanceName] = entry.value;
                }
            }
        });
        return Object.keys(substanceCosts).map((substance) => ({
            name: substance,
            value: substanceCosts[substance],
        }));
    }

    /**
     * Calculates total spending from cost table.
     * @param costs Array of cost entries
     */
    calculateTotalSpendingFromCosts(costs: any[]): number {
        return costs.reduce((total, entry) => total + (entry.value || 0), 0);
    }

    /**
     * Calculates spending for a given period from cost table.
     * @param costs Array of cost entries
     * @param period Time period ("week", "month", "year", "all")
     */
    calculateSpendingByPeriodFromCosts(costs: any[], period: "week" | "month" | "year" | "all" = "all"): number {
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
        return costs
            .filter((entry) => new Date(entry.date) >= startDate)
            .reduce((total, entry) => total + (entry.value || 0), 0);
    }

    /**
     * Projects annual spending based on the total spent in the last month.
     * @param costs Array of cost entries
     */
    projectAnnualSpendingFromCosts(costs: CostDto[]): number {
        const monthlySpending = this.calculateSpendingByPeriodFromCosts(costs, "month");

        return monthlySpending * 12;
    }

    /**
     * Calculates potential savings over a number of years from cost table.
     * @param costs Array of cost entries
     * @param years Number of years
     */
    calculatePotentialSavingsFromCosts(costs: any[], years: number): number {
        const annualSpending = this.projectAnnualSpendingFromCosts(costs);
        return annualSpending * years;
    }

    /**
     * Calculates investment growth with annual savings and interest from cost table.
     * @param costs Array of cost entries
     * @param years Number of years
     * @param interestRate Annual interest rate (default 7%)
     */
    calculateInvestmentGrowthFromCosts(costs: any[], years: number, interestRate = 0.07): number {
        const annualSavings = this.projectAnnualSpendingFromCosts(costs);
        let total = 0;
        for (let i = 0; i < years; i++) {
            total = (total + annualSavings) * (1 + interestRate);
        }
        return total;
    }

    /**
     * Prepares daily spending trend data for the last 30 days from cost table.
     * @param costs Array of cost entries
     */
    async prepareSpendingTrendDataFromCosts(costs: any[]) {
        const spendingByDate = new Map<string, number>();
        const dates: string[] = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            dates.push(dateStr);
            spendingByDate.set(dateStr, 0);
        }
        costs.forEach((entry) => {
            const dateStr = new Date(entry.date).toISOString().split("T")[0];
            if (spendingByDate.has(dateStr) && entry.value) {
                spendingByDate.set(dateStr, (spendingByDate.get(dateStr) || 0) + entry.value);
            }
        });

        return dates.map((date) => ({
            date,
            spending: spendingByDate.get(date) ?? 0,
        }));
    }
}
