import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UsageService } from "../../services/usage.service";
import { SubstanceService } from "../../services/substance.service";
import { UsageDto } from "../../dto/usage.dto";
import { SubstanceDto } from "../../dto/substance.dto";
import { FinancialImpactCardComponent } from "../../components/financial-impact-card.component";
import { CostService } from "../../services/cost.service";
import { SubstanceAnalysisCardComponent } from "../../components/substance-analysis-card.component";

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
    imports: [CommonModule, FormsModule, FinancialImpactCardComponent, SubstanceAnalysisCardComponent],
    templateUrl: "./recovery-dashboard.component.html",
})
export class RecoveryDashboardComponent implements OnInit {

    selectedAnalysisSubstance: string = "all";
    COLORS = ["#8B5CF6", "#F97316", "#6366F1", "#FB923C", "#A855F7", "#FDBA74"];

    usageHistory = signal<UsageDto[]>([]);
    substances = signal<Map<number, SubstanceDto>>(new Map([]));

    constructor(
        private usageService: UsageService,
        private substanceService: SubstanceService,
        private costService: CostService,
    ) {}

    ngOnInit() {
        this.usageService.list().then((usages) => {
            this.usageHistory.set(usages as UsageDto[]);
        });
        this.substanceService.list().then((subs) => {
            this.substances.set(this.substanceService.getDataAsMap(subs, 'id') as Map<number, SubstanceDto>);
        });
    }

    setSelectedAnalysisSubstance(substance: string) {
        this.selectedAnalysisSubstance = substance;
    }

    getSubstanceNames(): string[] {
        return Array.from(this.substances().values()).map(substance => substance.name);
    }

    calculateSobrietyDays(): number {
        if (this.usageHistory.length === 0) return 0;
        const sortedHistory = [...this.usageHistory()].sort(
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
        this.usageHistory().forEach((entry) => {
            const substanceName = this.substances().get(entry.substance)?.name as string;
            if (substanceCounts[substanceName]) {
                substanceCounts[substanceName]++;
            } else {
                substanceCounts[substanceName] = 1;
            }
        });
        return Object.keys(substanceCounts).map((substance) => ({
            name: substance,
            count: substanceCounts[substance],
        }));
    }

    getFilteredUsageHistory() {
        if (this.selectedAnalysisSubstance === "all") {
            return this.usageHistory();
        }
        return this.usageHistory().filter(
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
        return this.costService.prepareCostBySubstanceData(this.usageHistory(), this.substances());
    }

    calculateTotalSpending(): number {
        return this.costService.calculateTotalSpending(this.usageHistory());
    }

    calculateSpendingByPeriod(period: "week" | "month" | "year" | "all" = "all"): number {
        return this.costService.calculateSpendingByPeriod(this.usageHistory(), period);
    }

    projectAnnualSpending(): number {
        return this.costService.projectAnnualSpending(this.usageHistory());
    }

    calculatePotentialSavings(years: number): number {
        return this.costService.calculatePotentialSavings(this.usageHistory(), years);
    }

    calculateInvestmentGrowth(years: number, interestRate = 0.07): number {
        return this.costService.calculateInvestmentGrowth(this.usageHistory(), years);
    }

    prepareSpendingTrendData() {
        return this.costService.prepareSpendingTrendData(this.usageHistory());
    }
}
