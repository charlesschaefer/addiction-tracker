import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";

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
    usageHistory: UsageEntry[] = [];
    substances: string[] = [];
    selectedAnalysisSubstance: string = "all";
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

    calculateSobrietyDays(): number {
        if (this.usageHistory.length === 0) return 0;
        const sortedHistory = [...this.usageHistory].sort(
            (a, b) =>
                new Date(b.date + "T" + b.time).getTime() -
                new Date(a.date + "T" + a.time).getTime()
        );
        const lastUsageDate = new Date(
            sortedHistory[0].date + "T" + sortedHistory[0].time
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
            (entry) => entry.substance === this.selectedAnalysisSubstance
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
            if (usageByDate[entry.date] !== undefined) {
                usageByDate[entry.date]++;
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
            if (moodByDate[entry.date]) {
                moodByDate[entry.date].total += moodValues[entry.mood] || 3;
                moodByDate[entry.date].count++;
            }
        });
        return dates.map((date) => ({
            date,
            mood:
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
            if (cravingByDate[entry.date] && entry.cravingIntensity) {
                cravingByDate[entry.date].total += entry.cravingIntensity;
                cravingByDate[entry.date].count++;
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
            mood: moodData[index].mood,
            craving: cravingData[index].craving,
        }));
    }

    prepareTriggerData() {
        const triggerCounts: { [key: string]: number } = {};
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            entry.triggers.forEach((trigger) => {
                triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
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
}
