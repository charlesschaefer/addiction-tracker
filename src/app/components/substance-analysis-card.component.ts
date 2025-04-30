import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ChartModule } from 'primeng/chart';
import { UsageDto } from "../dto/usage.dto";
import { SubstanceDto } from "../dto/substance.dto";
import { ChartData } from "chart.js";
import { SentimentService } from "../services/sentiment.service";

@Component({
    selector: "app-substance-analysis-card",
    standalone: true,
    imports: [CommonModule, ChartModule],
    templateUrl: "./substance-analysis-card.component.html",
})
export class SubstanceAnalysisCardComponent {
    @Input() usageHistory: UsageDto[] = [];
    @Input() substances: Map<number, SubstanceDto> = new Map();
    
    selectedAnalysisSubstance: string = "all";
    COLORS = ["#8B5CF6", "#F97316", "#6366F1", "#FB923C", "#A855F7", "#FDBA74"];

    // Chart options
    barOptions = {
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

    lineOptions = {
        plugins: {
            legend: {
                display: true
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const mood = SentimentService.sentiments[context.parsed.y];
                        return `${mood.emoji}: ${mood.label}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    pieOptions = {
        plugins: {
            legend: {
                position: 'right'
            }
        }
    };

    setSelectedAnalysisSubstance(substance: string) {
        this.selectedAnalysisSubstance = substance;
    }

    getFilteredUsageHistory() {
        if (this.selectedAnalysisSubstance === "all") {
            return this.usageHistory;
        }
        const substance = Array.from(this.substances.values()).find(s => s.name === this.selectedAnalysisSubstance);
        if (!substance) {
            return this.usageHistory;
        }
        return this.usageHistory.filter(
            (entry) => entry.substance === substance.id
        );
    }

    prepareUsageBySubstanceData(): ChartData {
        const substanceCounts: { [key: string]: number } = {};
        this.usageHistory.forEach((entry) => {
            const substanceName = this.substances.get(entry.substance)?.name as string;
            if (substanceCounts[substanceName]) {
                substanceCounts[substanceName]++;
            } else {
                substanceCounts[substanceName] = 1;
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

    prepareSubstanceUsageData() {
        const usageByDate: { [key: string]: number } = {};
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
                usageByDate[dateKey]++;
            }
        });
        return dates.map((date) => ({
            date: date.toISOString(),
            usage: usageByDate[date.toISOString().split('T')[0]],
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
            if (moodByDate[dateKey]) {
                moodByDate[dateKey].total += moodValues[entry.sentiment] || 3;
                moodByDate[dateKey].count++;
            }
        });
        return dates.map((date) => ({
            date: date.toISOString(),
            sentiment: moodByDate[date.toISOString().split('T')[0]].count > 0 
                ? moodByDate[date.toISOString().split('T')[0]].total / moodByDate[date.toISOString().split('T')[0]].count 
                : null,
        }));
    }

    prepareCravingTrendData() {
        const cravingByDate: { [key: string]: { total: number; count: number } } = {};
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

    prepareCombinedTrendData(): ChartData {
        const usageData = this.prepareSubstanceUsageData();
        const moodData = this.prepareMoodTrendData();
        const cravingData = this.prepareCravingTrendData();
        const firstColor = randBeetween(0, this.COLORS.length);
        const secondColor = firstColor == this.COLORS.length - 1 ? 0 : firstColor + 1;
        const thirdColor = secondColor == this.COLORS.length - 1 ? 0 : secondColor + 1;

        return {
            labels: usageData.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            }),
            datasets: [
                {
                    label: 'Usage',
                    data: usageData.map(item => item.usage),
                    borderColor: this.COLORS[firstColor],
                    tension: 0.4,
                    fill: true,
                    backgroundColor: this.COLORS[firstColor] + '80',
                    order: 3
                },
                {
                    label: 'Mood',
                    data: moodData.map(item => item.sentiment),
                    borderColor: this.COLORS[secondColor],
                    backgroundColor: this.COLORS[secondColor] + '80',
                    tension: 0.4,
                    borderDash: [2, 2],
                    order: 2,
                },
                {
                    label: 'Craving',
                    data: cravingData.map(item => item.craving),
                    borderColor: this.COLORS[thirdColor],
                    backgroundColor: this.COLORS[thirdColor] + '80',
                    tension: 0.4,
                    order: 1
                }
            ]
        };
    }

    prepareTriggerData(): ChartData {
        const triggerCounts: { [key: string]: number } = {};
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            entry.trigger?.forEach((trigger) => {
                triggerCounts[trigger.name] = (triggerCounts[trigger.name] || 0) + 1;
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
