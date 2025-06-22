import { CommonModule } from "@angular/common";
import { Component, computed, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UsageService } from "../../services/usage.service";
import { SubstanceService } from "../../services/substance.service";
import { UsageDto } from "../../dto/usage.dto";
import { SubstanceDto } from "../../dto/substance.dto";
import { FinancialImpactCardComponent } from "../../components/financial-impact-card/financial-impact-card.component";
import { CostService } from "../../services/cost.service";
import { SubstanceAnalysisCardComponent } from "../../components/substance/substance-analysis-card.component";
import {
    SobrietyCardComponent,
    SobrietyCardStyle,
} from "../../components/sobriety/sobriety-card.component";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { SentimentService } from "../../services/sentiment.service";
import { TriggerService } from "../../services/trigger.service";
import { RouterLink } from "@angular/router";
import { TranslocoAvailableLangs } from "../../app.config";
import { getDateForChart } from "../../util/date.utils";
import { SelectModule } from "primeng/select";
import { SubstanceSelectorComponent } from "../../components/substance/substance-selector.component";

@Component({
    selector: "app-recovery-dashboard",
    standalone: true,
    imports: [
    CommonModule,
    FormsModule,
    FinancialImpactCardComponent,
    SubstanceAnalysisCardComponent,
    SobrietyCardComponent,
    TranslocoModule,
    RouterLink,
    SelectModule,
    SubstanceSelectorComponent
],
    templateUrl: "./recovery-dashboard.component.html",
})
export class RecoveryDashboardComponent implements OnInit {
    Array = Array;

    selectedAnalysisSubstance = signal(0);
    COLORS = ["#8B5CF6", "#F97316", "#6366F1", "#FB923C", "#A855F7", "#FDBA74"];

    usageHistory = signal<UsageDto[]>([]);
    substances = signal<Map<number, SubstanceDto>>(new Map([]));
    chartOptions: any;
    sobrietyComponentStyle = SobrietyCardStyle.SIMPLE_DAYS;

    usageBySubstance = signal<any[]>([]);
    triggerData = signal<any[]>([]);
    moodCravingCorrelation = signal<any[]>([]);
    triggerCravingCorrelation = signal<any[]>([]);
    substanceMap = computed<SubstanceDto[]>(() => Array.from(this.substances().values()));

    locale: TranslocoAvailableLangs;

    constructor(
        private usageService: UsageService,
        private substanceService: SubstanceService,
        private costService: CostService,
        private sentimentService: SentimentService,
        private triggerService: TriggerService,
        private translateService: TranslocoService
    ) {
        this.initChartOptions();
        this.locale = this.translateService
                .getActiveLang()
                .split("-")
                .map((value, idx) => idx === 1 ? value.toUpperCase() : value)
                .join("-") as TranslocoAvailableLangs;
    }

    ngOnInit() {
        this.usageService.list().then((usages) => {
            this.usageHistory.set(usages as UsageDto[]);
            this.updatePreparedData();
        });
        this.substanceService.list().then((subs) => {
            this.substances.set(
                this.substanceService.getDataAsMap(subs, "id") as Map<
                    number,
                    SubstanceDto
                >
            );
            this.updatePreparedData();
        });
    }

    updatePreparedData() {
        // Only update if both usageHistory and substances are loaded
        if (!this.usageHistory() || !this.substances()) return;
        this.usageBySubstance.set(this.prepareUsageBySubstanceData());
        this.triggerData.set(this.prepareTriggerData());
        this.prepareMoodCravingCorrelationDataAsync();
        this.prepareTriggerCravingCorrelationDataAsync();
    }

    onSelectedAnalysisSubstanceChange() {
        this.updatePreparedData();
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
        const substanceCounts: Record<string, number> = {};
        this.usageHistory().forEach((entry) => {
            const substanceName = this.substances().get(entry.substance)
                ?.name as string;
            if (substanceCounts[substanceName]) {
                substanceCounts[substanceName] += entry.quantity || 1;
            } else {
                substanceCounts[substanceName] = entry.quantity || 1;
            }
        });
        return Object.keys(substanceCounts).map((substance) => ({
            name: substance,
            count: substanceCounts[substance],
        }));
    }

    getFilteredUsageHistory() {
        if (this.selectedAnalysisSubstance() === 0) {
            return this.usageHistory();
        }
        return this.usageHistory().filter(
            (entry) =>
                entry.substance === this.selectedAnalysisSubstance()
        );
    }

    initChartOptions() {
        const locale = this.locale;
        this.chartOptions = {
            plugins: {
                legend: {
                    position: "bottom",
                },
            },
            // responsive: true,
            // maintainAspectRatio: false,
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
                            return getDateForChart(value.date, locale);
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
        const usageByDate: Record<string, number> = {};
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
                usageByDate[entryDate.toISOString()] += entry.quantity || 1;
            }
        });
        return dates.map((date) => ({
            date: date.toISOString(),
            usage: usageByDate[date.toISOString()],
        }));
    }

    prepareMoodTrendData() {
        const moodByDate: Record<string, { total: number; count: number }> =
            {};
        const moodValues: Record<string, number> = {
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
        const cravingByDate: Record<string, { total: number; count: number }> = {};
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
            date: getDateForChart(item.date, this.locale),
            usage: item.usage,
            mood: moodData[index].sentiment,
            craving: cravingData[index].craving,
        }));
    }

    prepareTriggerData() {
        const triggerCounts: Record<string, number> = {};
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

    /**
     * Prepares data for Trigger vs Craving correlation chart.
     * Returns array: [{ trigger: string, avgCraving: number, count: number }]
     */
    async prepareTriggerCravingCorrelationDataAsync() {
        const labels = await this.triggerService.getTriggerLabels();
        const data = this.usageService.getTriggerCravingCorrelation(
            this.getFilteredUsageHistory(),
            labels
        ).sort((a, b) => b.avgCraving > a.avgCraving ? 1 : -1);
        
        this.triggerCravingCorrelation.set(data.slice(0, 8));
    }

    // Change these to async if needed (for trigger labels)
    async prepareMoodCravingCorrelationDataAsync() {
        const labels = this.sentimentService.getSentimentLabels();
        const data = this.usageService.getMoodCravingCorrelation(
            this.getFilteredUsageHistory(),
            labels
        );
        this.moodCravingCorrelation.set(data);
    }
}
