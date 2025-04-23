import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

interface UsageEntry {
    id: number;
    substance: string;
    date: string;
    time: string;
    amount: string;
    mood: string;
    triggers: string[];
    cost: number;
    cravingIntensity: number;
}

@Component({
    selector: "app-financial-impact",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./financial-impact.component.html",
})
export class FinancialImpactComponent implements OnInit {
    usageHistory: UsageEntry[] = [];
    substances: string[] = [];
    COLORS = ["#8B5CF6", "#F97316", "#6366F1", "#FB923C", "#A855F7", "#FDBA74"];

    ngOnInit() {
        if (this.usageHistory.length === 0) {
            this.usageHistory = this.generateSampleData();
        }
    }

    generateSampleData(): UsageEntry[] {
        const substances = ["Alcohol", "Cigarettes", "Cannabis"];
        this.substances = substances;
        const moods = ["Sad", "Anxious", "Neutral", "Good", "Great"];
        const sampleTriggers = [
            "Stress",
            "Social gathering",
            "Boredom",
            "Anxiety",
            "Celebration",
        ];
        const today = new Date();
        const sampleData: UsageEntry[] = [];
        for (let i = 30; i >= 0; i--) {
            if (i % 3 === 0 && i > 5) continue;
            const entryDate = new Date(today);
            entryDate.setDate(today.getDate() - i);
            const substance =
                substances[Math.floor(Math.random() * substances.length)];
            const entryMood = moods[Math.floor(Math.random() * moods.length)];
            const cravingLevel = Math.floor(Math.random() * 10) + 1;
            const entryTriggers: string[] = [];
            const numTriggers = Math.floor(Math.random() * 2) + 1;
            for (let j = 0; j < numTriggers; j++) {
                const trigger =
                    sampleTriggers[
                        Math.floor(Math.random() * sampleTriggers.length)
                    ];
                if (!entryTriggers.includes(trigger))
                    entryTriggers.push(trigger);
            }
            let cost = 0;
            if (substance === "Alcohol")
                cost = Math.floor(Math.random() * 30) + 5;
            else if (substance === "Cigarettes")
                cost = Math.floor(Math.random() * 10) + 8;
            else if (substance === "Cannabis")
                cost = Math.floor(Math.random() * 40) + 20;
            sampleData.push({
                id: Date.now() - i * 1000000,
                substance,
                date: entryDate.toISOString().split("T")[0],
                time: `${String(Math.floor(Math.random() * 24)).padStart(
                    2,
                    "0"
                )}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
                amount:
                    substance === "Alcohol"
                        ? `${Math.floor(Math.random() * 3) + 1} drinks`
                        : substance === "Cigarettes"
                        ? `${Math.floor(Math.random() * 5) + 1} cigarettes`
                        : `${Math.floor(Math.random() * 2) + 1} uses`,
                mood: entryMood,
                triggers: entryTriggers,
                cost: cost,
                cravingIntensity: cravingLevel,
            });
        }
        return sampleData;
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
            .filter((entry) => new Date(entry.date) >= startDate)
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
            if (spendingByDate[entry.date] !== undefined && entry.cost) {
                spendingByDate[entry.date] += entry.cost;
            }
        });
        return dates.map((date) => ({
            date,
            spending: spendingByDate[date],
        }));
    }
}
