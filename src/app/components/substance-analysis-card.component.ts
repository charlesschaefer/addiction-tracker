import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ChartModule } from 'primeng/chart';
import { UsageDto } from "../dto/usage.dto";
import { SubstanceDto } from "../dto/substance.dto";

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

    prepareUsageBySubstanceData() {
        const substanceCounts: { [key: string]: number } = {};
        this.usageHistory.forEach((entry) => {
            const substanceName = this.substances.get(entry.substance)?.name as string;
            if (substanceCounts[substanceName]) {
                substanceCounts[substanceName]++;
            } else {
                substanceCounts[substanceName] = 1;
            }
        });

        const returnData = {
            labels: Object.keys(substanceCounts),
            datasets: [{
                label: "Usage",
                data: Object.values(substanceCounts)
            }]
        };
        return returnData;
        // return Object.keys(substanceCounts).map((substanceName) => ({
        //     name: substanceName,
        //     count: substanceCounts[substanceName],
        // }));

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

    prepareCombinedTrendData() {
        const usageData = this.prepareSubstanceUsageData();
        const moodData = this.prepareMoodTrendData();
        const cravingData = this.prepareCravingTrendData();

        return {
            labels: usageData.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            }),
            datasets: [
                {
                    label: 'Usage',
                    data: usageData.map(item => item.usage),
                    borderColor: this.COLORS[0],
                    tension: 0.4
                },
                {
                    label: 'Mood',
                    data: moodData.map(item => item.sentiment),
                    borderColor: this.COLORS[1],
                    tension: 0.4
                },
                {
                    label: 'Craving',
                    data: cravingData.map(item => item.craving),
                    borderColor: this.COLORS[2],
                    tension: 0.4
                }
            ]
        };
    }

    prepareTriggerData() {
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
        return triggerData.labels.length > 0;
    }

    hasUsageData(): boolean {
        const usageData = this.prepareUsageBySubstanceData();
        return usageData.labels.length > 0;
    }
}
