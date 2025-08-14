import { CommonModule } from "@angular/common";
import { Component, computed, input, Input, inject } from "@angular/core";
import { ChartModule } from 'primeng/chart';
import { UsageDto } from "../../dto/usage.dto";
import { SubstanceDto } from "../../dto/substance.dto";
import { ChartData, ChartOptions } from "chart.js";
import { SentimentService } from "../../services/sentiment.service";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { RouterLink } from "@angular/router";
import { getDateForChart } from "../../util/date.utils";

@Component({
    selector: "app-substance-analysis-card",
    standalone: true,
    imports: [CommonModule, ChartModule, TranslocoModule, RouterLink],
    templateUrl: "./substance-analysis-card.component.html",
})
export class SubstanceAnalysisCardComponent {
    private translateService = inject(TranslocoService);

    @Input() usageHistory: UsageDto[] = [];
    substances = input<Map<number, SubstanceDto>>(new Map<number, SubstanceDto>());
    activeTriggers = input<string[]>([]);
    substanceMap = computed<SubstanceDto[]>(() => Array.from(this.substances().values()));
    combinedTrendData = computed<ChartData>(() => this.prepareCombinedTrendData());
    usageBySubstanceData = computed<ChartData>(() => this.prepareUsageBySubstanceData());
    triggerData = computed<ChartData>(() => this.prepareTriggerData());
    selectedAnalysisSubstance = input(0);
    
    COLORS = ["#8B5CF6", "#6366F1", "#FB923C", "#A855F7", "#FDBA74"];

    barOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    lineOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const prefix = context?.dataset.label + ": ";
                        if (context.datasetIndex === 1) {
                            const mood = SentimentService.sentiments[context.parsed.y];
                            return `${prefix} ${mood.emoji} ${mood.label}`;
                        }
                        return prefix + context?.formattedValue;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true
            },
            y1: {
                type: 'linear',
                position: 'right',
                min: -1,
                max: 4,
                border: {
                    color: "#D68303",
                },
                ticks: {
                    color: "#D68303",
                    font: {
                        size: 18,
                    },
                    stepSize: 1,
                    callback: (value: number | string) => {
                        if (value != -1) {
                            const mood = SentimentService.sentiments[value as number];
                            return `${mood.emoji}`;// ${mood.label}`;
                        }
                        return '';
                    }
                },
                grid: {
                    drawOnChartArea: true,
                    drawTicks: true,
                    display: !false,
                }
            }
        }
    };

    pieOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right'
            }
        }
    };

    setSelectedAnalysisSubstance(_substance: string) {
        //this.selectedAnalysisSubstance.set(substance);
    }

    getFilteredUsageHistory() {
        if (this.selectedAnalysisSubstance() === 0) {
            return this.usageHistory;
        }
        //const substance = Array.from(this.substanceMap()).find(s => s.name === this.selectedAnalysisSubstance());
        const substance = Array.from(this.substanceMap()).find(s => s.id === this.selectedAnalysisSubstance());
        if (!substance) {
            return this.usageHistory;
        }
        return this.usageHistory.filter(
            (entry) => entry.substance === substance.id
        );
    }

    /**
     * Prepares chart data showing usage count for each substance.
     * @returns {ChartData} Chart.js data object for substance usage.
     */
    prepareUsageBySubstanceData(): ChartData {
        const substanceCounts: Record<string, number> = {};
        this.usageHistory.forEach((entry) => {
            const substanceName = this.substances().get(entry.substance)?.name as string;
            if (substanceCounts[substanceName]) {
                substanceCounts[substanceName] += entry.quantity || 1;
            } else {
                substanceCounts[substanceName] = entry.quantity || 1;
            }
        });

        const substanceCountsKeys = Object.keys(substanceCounts);

        const returnData = {
            labels: substanceCountsKeys,
            datasets: [{
                label: "Usage",
                data: Object.values(substanceCounts),
                borderColor: substanceCountsKeys.map((val, idx) => this.COLORS[idx]),
                backgroundColor: substanceCountsKeys.map((val, idx) => this.COLORS[idx]),
            }]
        } as ChartData;
        return returnData;
    }

    /**
     * Prepares an array of daily usage counts for the selected substance (or all).
     * @returns {Array<{date: string, usage: number}>} Array of usage per day.
     */
    prepareSubstanceUsageData() {
        const usageByDate: Record<string, number> = {};
        const dates: Date[] = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date);
            usageByDate[date.toISOString().split('T')[0]] = 0;
        }
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            const entryDate = new Date(entry.datetime);
            const dateKey = entryDate.toISOString().split('T')[0];
            if (usageByDate[dateKey] !== undefined) {
                usageByDate[dateKey] += entry.quantity || 1;
            }
        });
        return dates.map((date) => ({
            date: date.toISOString(),
            usage: usageByDate[date.toISOString().split('T')[0]],
        }));
    }

    /**
     * Prepares an array of average mood values per day for the selected substance (or all).
     * @returns {Array<{date: string, sentiment: number|null}>} Array of average mood per day.
     */
    prepareMoodTrendData() {
        const moodByDate: Record<string, { total: number; count: number }> = {};
        const dates: Date[] = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date);
            moodByDate[date.toISOString().split('T')[0]] = { total: 0, count: 0 };
        }
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            const entryDate = new Date(entry.datetime);
            const dateKey = entryDate.toISOString().split('T')[0];
            if (moodByDate[dateKey] && entry.sentiment !== null) {
                const moodIndex = entry.sentiment;
                moodByDate[dateKey].total += moodIndex;
                moodByDate[dateKey].count++;
            }
        });
        return dates.map((date) => {
            const dateKey = date.toISOString().split('T')[0];
            const moodData = moodByDate[dateKey];
            return {
                date: date.toISOString(),
                sentiment: moodData.count > 0 
                    ? Math.round(moodData.total / moodData.count) 
                    : null,
            };
        });
    }

    /**
     * Prepares an array of average craving values per day for the selected substance (or all).
     * @returns {Array<{date: string, craving: number|null}>} Array of average craving per day.
     */
    prepareCravingTrendData() {
        const cravingByDate: Record<string, { total: number; count: number }> = {};
        const dates: Date[] = [];
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date);
            cravingByDate[date.toISOString().split('T')[0]] = { total: 0, count: 0 };
        }
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            const entryDate = new Date(entry.datetime);
            const dateKey = entryDate.toISOString().split('T')[0];
            if (cravingByDate[dateKey] && entry.craving) {
                cravingByDate[dateKey].total += entry.craving;
                cravingByDate[dateKey].count++;
            }
        });
        return dates.map((date) => ({
            date: date.toISOString(),
            craving: cravingByDate[date.toISOString().split('T')[0]].count > 0 
                ? cravingByDate[date.toISOString().split('T')[0]].total / cravingByDate[date.toISOString().split('T')[0]].count 
                : null,
        }));
    }

    /**
     * Prepares combined chart data for usage, mood, and craving trends over time.
     * @returns {ChartData} Chart.js data object for combined trends.
     */
    prepareCombinedTrendData(): ChartData {
        const usageData = this.prepareSubstanceUsageData();
        const moodData = this.prepareMoodTrendData();
        const cravingData = this.prepareCravingTrendData();
        const firstColor = randBeetween(0, this.COLORS.length - 1);
        const thirdColor = (firstColor === this.COLORS.length - 1) ? 0 : firstColor + 1;
        const secondColorCode = "#D68303";

        const locale = this.translateService.getActiveLang().split("-").map((value, idx) => idx === 1 ? value.toUpperCase() : value).join("-");

        const chartData =  {
            labels: usageData.map(item => getDateForChart(item.date, locale)),
            datasets: [
                {
                    label: this.translateService.translate('Usage'),
                    data: usageData.map(item => item.usage),
                    borderColor: this.COLORS[firstColor],
                    backgroundColor: this.COLORS[firstColor] + '80',
                    tension: 0.4,
                    fill: true,
                    borderDash: [],
                    order: 3
                },
                {
                    yAxisID: 'y1',
                    label: this.translateService.translate('Mood'),
                    data: moodData.map(item => item.sentiment !== null ? item.sentiment : -1),
                    borderColor: secondColorCode,
                    backgroundColor: secondColorCode + '80',
                    tension: 0.4,
                    pointStyle: (context: any) => {
                        if (context.parsed.y !== -1) {
                            const img = new Image();
                            img.src = '/assets/emojis/' + context.parsed.y + '.png';
                            img.width = 17;
                            img.height = 17;
                            return img;
                        }
                        return 'circle'
                        //return mood ? mood.emoji : '';
                    },
                    fill: false,
                    //borderDash: [2, 2],
                    order: 1,
                },
                {
                    label: this.translateService.translate('Craving'),
                    data: cravingData.map(item => item.craving ?? 0),
                    borderColor: this.COLORS[thirdColor],
                    backgroundColor: this.COLORS[thirdColor] + '80',
                    tension: 0.4,
                    fill: false,
                    borderDash: [],
                    order: 2
                }
            ]
        };
        console.log("chartData", chartData);
        return chartData;
    }

    /**
     * Prepares chart data for trigger occurrence counts.
     * @returns {ChartData} Chart.js data object for triggers.
     */
    prepareTriggerData(): ChartData {
        const triggerCounts: Record<string, number> = {};
        const activeTriggers = this.activeTriggers();
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            entry.trigger?.forEach((trigger) => {
                if (!activeTriggers.includes(trigger.name)) {
                    return;
                }
                //triggerCounts[trigger.name] = (triggerCounts[trigger.name] || 0) + 1;
                triggerCounts[trigger.name] = (triggerCounts[trigger.name] || 0) + (entry.quantity || 1);
            });
        });

        return {
            labels: Object.keys(triggerCounts),
            datasets: [{
                data: Object.values(triggerCounts),
                backgroundColor: this.COLORS
            }]
        };
    }

    hasDataForSelectedSubstance(): boolean {
        const filteredHistory = this.getFilteredUsageHistory();
        return filteredHistory.length > 0;
    }

    hasTriggerData(): boolean {
        const triggerData = this.prepareTriggerData();
        return (triggerData.labels && triggerData.labels.length > 0) as boolean;
    }

    hasUsageData(): boolean {
        const usageData = this.prepareUsageBySubstanceData();
        return (usageData.labels && usageData.labels.length > 0) as boolean;
    }
}

function randBeetween(start: number, end: number): number {
    return Math.floor(Math.random() * (end - start + 1) + start);
}

