import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { UsageService } from "../../services/usage.service";
import { SubstanceService } from "../../services/substance.service";
import { UsageDto } from "../../dto/usage.dto";
import { SubstanceDto } from "../../dto/substance.dto";

@Component({
    selector: "app-financial-impact",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./financial-impact.component.html",
})
export class FinancialImpactComponent implements OnInit {
    usageHistory: UsageDto[] = [];
    substances: SubstanceDto[] = [];
    COLORS = ["#8B5CF6", "#F97316", "#6366F1", "#FB923C", "#A855F7", "#FDBA74"];

    constructor(
        private usageService: UsageService,
        private substanceService: SubstanceService
    ) {}

    ngOnInit() {
        this.usageService.list().then((usages) => {
            this.usageHistory = usages as UsageDto[];
        });
        this.substanceService.list().then((subs) => {
            this.substances = subs as SubstanceDto[];
        });
    }

    prepareCostBySubstanceData() {
        const substanceCosts: { [key: string]: number } = {};
        this.usageHistory.forEach((entry) => {
            if (entry.cost) {
                if (substanceCosts[entry.substance]) {
                    substanceCosts[entry.substance] += entry.cost;
                } else {
                    substanceCosts[entry.substance] = entry.cost;
                }
            }
        });
        return Object.keys(substanceCosts).map((substance) => ({
            name: substance,
            value: substanceCosts[substance],
        }));
    }

    calculateTotalSpending(): number {
        return this.usageHistory.reduce((total, entry) => total + (entry.cost || 0), 0);
    }

    calculateSpendingByPeriod(period: "week" | "month" | "year" | "all" = "all"): number {
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
        return this.usageHistory
            .filter((entry) => new Date(entry.datetime) >= startDate)
            .reduce((total, entry) => total + (entry.cost || 0), 0);
    }

    projectAnnualSpending(): number {
        const monthlySpending = this.calculateSpendingByPeriod("month");
        return monthlySpending * 12;
    }

    calculatePotentialSavings(years: number): number {
        const annualSpending = this.projectAnnualSpending();
        return annualSpending * years;
    }

    calculateInvestmentGrowth(years: number, interestRate = 0.07): number {
        const annualSavings = this.projectAnnualSpending();
        let total = 0;
        for (let i = 0; i < years; i++) {
            total = (total + annualSavings) * (1 + interestRate);
        }
        return total;
    }

    prepareSpendingTrendData() {
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
        this.usageHistory.forEach((entry) => {
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
