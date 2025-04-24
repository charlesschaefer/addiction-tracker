import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UsageService } from "../../services/usage.service";
import { SubstanceService } from "../../services/substance.service";
import { UsageDto } from "../../dto/usage.dto";
import { SubstanceDto } from "../../dto/substance.dto";

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
    selector: "app-recovery-dashboard",
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: "./recovery-dashboard.component.html",
})
export class RecoveryDashboardComponent implements OnInit {
    usageHistory: UsageDto[] = [];
    substances: SubstanceDto[] = [];
    selectedAnalysisSubstance: string = "all";
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

    calculateSobrietyDays(): number {
        if (this.usageHistory.length === 0) return 0;
        const sortedHistory = [...this.usageHistory].sort(
            (a, b) =>
                new Date(b.datetime).getTime() -
                new Date(a.datetime).getTime()
        );
        const lastUsageDate = new Date(
            sortedHistory[0].datetime
        );
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastUsageDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    prepareUsageBySubstanceData() {
        const substanceCounts: { [key: string]: number } = {};
        this.usageHistory.forEach((entry) => {
            if (substanceCounts[entry.substance]) {
                substanceCounts[entry.substance]++;
            } else {
                substanceCounts[entry.substance] = 1;
            }
        });
        return Object.keys(substanceCounts).map((substance) => ({
            name: substance,
            count: substanceCounts[substance],
        }));
    }

    getFilteredUsageHistory() {
        if (this.selectedAnalysisSubstance === "all") {
            return this.usageHistory;
        }
        return this.usageHistory.filter(
            (entry) => entry.substance.toString() === this.selectedAnalysisSubstance
        );
    }

    prepareSubstanceUsageData() {
        const usageByDate: { [key: string]: number } = {};
        const dates: string[] = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            dates.push(dateStr);
            usageByDate[dateStr] = 0;
        }
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            if (usageByDate[entry.datetime.toISOString().split("T")[0]] !== undefined) {
                usageByDate[entry.datetime.toISOString().split("T")[0]]++;
            }
        });
        return dates.map((date) => ({
            date,
            usage: usageByDate[date],
        }));
    }

    prepareMoodTrendData() {
        const moodByDate: { [key: string]: { total: number; count: number } } = {};
        const moodValues: { [key: string]: number } = {
            Sad: 1,
            Anxious: 2,
            Neutral: 3,
            Good: 4,
            Great: 5,
        };
        const dates: string[] = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            dates.push(dateStr);
            moodByDate[dateStr] = { total: 0, count: 0 };
        }
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            if (moodByDate[entry.datetime.toISOString().split("T")[0]]) {
                moodByDate[entry.datetime.toISOString().split("T")[0]].total += moodValues[entry.sentiment] || 3;
                moodByDate[entry.datetime.toISOString().split("T")[0]].count++;
            }
        });
        return dates.map((date) => ({
            date,
            sentiment:
                moodByDate[date].count > 0
                    ? moodByDate[date].total / moodByDate[date].count
                    : null,
        }));
    }

    prepareCravingTrendData() {
        const cravingByDate: { [key: string]: { total: number; count: number } } = {};
        const dates: string[] = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            dates.push(dateStr);
            cravingByDate[dateStr] = { total: 0, count: 0 };
        }
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            if (cravingByDate[entry.datetime.toISOString().split("T")[0]] && entry.craving) {
                cravingByDate[entry.datetime.toISOString().split("T")[0]].total += entry.craving;
                cravingByDate[entry.datetime.toISOString().split("T")[0]].count++;
            }
        });
        return dates.map((date) => ({
            date,
            craving:
                cravingByDate[date].count > 0
                    ? cravingByDate[date].total / cravingByDate[date].count
                    : null,
        }));
    }

    prepareCombinedTrendData() {
        const usageData = this.prepareSubstanceUsageData();
        const moodData = this.prepareMoodTrendData();
        const cravingData = this.prepareCravingTrendData();
        return usageData.map((item, index) => ({
            date: item.date,
            usage: item.usage,
            mood: moodData[index].sentiment,
            craving: cravingData[index].craving,
        }));
    }

    prepareTriggerData() {
        const triggerCounts: { [key: string]: number } = {};
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            entry.trigger?.forEach((trigger) => {
                triggerCounts[trigger.name] = (triggerCounts[trigger.name] || 0) + 1;
            });
        });
        return Object.keys(triggerCounts).map((trigger) => ({
            name: trigger,
            value: triggerCounts[trigger],
        }));
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
}
