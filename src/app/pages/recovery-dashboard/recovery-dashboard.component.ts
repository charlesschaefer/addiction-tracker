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
import { DateTime } from "luxon";
import {
    SobrietyCardComponent,
    SobrietyCardStyle,
} from "../../components/sobriety-card/sobriety-card.component";
import { TranslocoModule } from "@jsverse/transloco";

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
    imports: [
        CommonModule,
        FormsModule,
        FinancialImpactCardComponent,
        SubstanceAnalysisCardComponent,
        SobrietyCardComponent,
        TranslocoModule
    ],
    templateUrl: "./recovery-dashboard.component.html",
})
export class RecoveryDashboardComponent implements OnInit {
    selectedAnalysisSubstance: string = "all";
    COLORS = ["#8B5CF6", "#F97316", "#6366F1", "#FB923C", "#A855F7", "#FDBA74"];

    usageHistory = signal<UsageDto[]>([]);
    substances = signal<Map<number, SubstanceDto>>(new Map([]));
    chartOptions: any;
    sobrietyComponentStyle = SobrietyCardStyle.SIMPLE_DAYS;

    constructor(
        private usageService: UsageService,
        private substanceService: SubstanceService,
        private costService: CostService
    ) {
        this.initChartOptions();
    }

    ngOnInit() {
        this.usageService.list().then((usages) => {
            this.usageHistory.set(usages as UsageDto[]);
        });
        this.substanceService.list().then((subs) => {
            this.substances.set(
                this.substanceService.getDataAsMap(subs, "id") as Map<
                    number,
                    SubstanceDto
                >
            );
        });
    }

    setSelectedAnalysisSubstance(substance: string) {
        this.selectedAnalysisSubstance = substance;
    }

    getSubstanceNames(): string[] {
        return Array.from(this.substances().values()).map(
            (substance) => substance.name
        );
    }

    calculateSobrietyDays(): number {
        return this.usageService.calculateSobrietyDays(this.usageHistory());
    }

    prepareUsageBySubstanceData() {
        const substanceCounts: { [key: string]: number } = {};
        this.usageHistory().forEach((entry) => {
            const substanceName = this.substances().get(entry.substance)
                ?.name as string;
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
            (entry) =>
                entry.substance.toString() === this.selectedAnalysisSubstance
        );
    }

    initChartOptions() {
        this.chartOptions = {
            plugins: {
                legend: {
                    position: "bottom",
                },
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: "Triggers",
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        callback: function (value: any) {
                            const date = new Date(value);
                            return date.toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "short",
                            });
                        },
                    },
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: "Number of Entries",
                    },
                },
            },
        };
    }

    prepareSubstanceUsageData() {
        const usageByDate: { [key: string]: number } = {};
        const dates: Date[] = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date);
            usageByDate[date.toISOString()] = 0;
        }
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            const entryDate = new Date(entry.datetime);
            if (usageByDate[entryDate.toISOString()] !== undefined) {
                usageByDate[entryDate.toISOString()]++;
            }
        });
        return dates.map((date) => ({
            date: date.toISOString(),
            usage: usageByDate[date.toISOString()],
        }));
    }

    prepareMoodTrendData() {
        const moodByDate: { [key: string]: { total: number; count: number } } =
            {};
        const moodValues: { [key: string]: number } = {
            Sad: 1,
            Anxious: 2,
            Neutral: 3,
            Good: 4,
            Great: 5,
        };
        const dates: Date[] = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date);
            moodByDate[date.toISOString()] = { total: 0, count: 0 };
        }
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            const entryDate = new Date(entry.datetime);
            if (moodByDate[entryDate.toISOString()]) {
                moodByDate[entryDate.toISOString()].total +=
                    moodValues[entry.sentiment] || 3;
                moodByDate[entryDate.toISOString()].count++;
            }
        });
        return dates.map((date) => ({
            date: date.toISOString(),
            sentiment:
                moodByDate[date.toISOString()].count > 0
                    ? moodByDate[date.toISOString()].total /
                      moodByDate[date.toISOString()].count
                    : null,
        }));
    }

    prepareCravingTrendData() {
        const cravingByDate: {
            [key: string]: { total: number; count: number };
        } = {};
        const dates: Date[] = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date);
            cravingByDate[date.toISOString()] = { total: 0, count: 0 };
        }
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            const entryDate = new Date(entry.datetime);
            if (cravingByDate[entryDate.toISOString()] && entry.craving) {
                cravingByDate[entryDate.toISOString()].total += entry.craving;
                cravingByDate[entryDate.toISOString()].count++;
            }
        });
        return dates.map((date) => ({
            date: date.toISOString(),
            craving:
                cravingByDate[date.toISOString()].count > 0
                    ? cravingByDate[date.toISOString()].total /
                      cravingByDate[date.toISOString()].count
                    : null,
        }));
    }

    prepareCombinedTrendData() {
        const usageData = this.prepareSubstanceUsageData();
        const moodData = this.prepareMoodTrendData();
        const cravingData = this.prepareCravingTrendData();
        return usageData.map((item, index) => ({
            date: new Date(item.date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
            }),
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
                triggerCounts[trigger.name] =
                    (triggerCounts[trigger.name] || 0) + 1;
            });
        });
        return Object.keys(triggerCounts).map((trigger) => ({
            name: trigger,
            value: triggerCounts[trigger],
        }));
    }

    prepareCostBySubstanceData() {
        return this.costService.prepareCostBySubstanceData(
            this.usageHistory(),
            this.substances()
        );
    }

    calculateTotalSpending(): number {
        return this.costService.calculateTotalSpending(this.usageHistory());
    }

    calculateSpendingByPeriod(
        period: "week" | "month" | "year" | "all" = "all"
    ): number {
        return this.costService.calculateSpendingByPeriod(
            this.usageHistory(),
            period
        );
    }

    projectAnnualSpending(): number {
        return this.costService.projectAnnualSpending(this.usageHistory());
    }

    calculatePotentialSavings(years: number): number {
        return this.costService.calculatePotentialSavings(
            this.usageHistory(),
            years
        );
    }

    calculateInvestmentGrowth(years: number, interestRate = 0.07): number {
        return this.costService.calculateInvestmentGrowth(
            this.usageHistory(),
            years
        );
    }
}
