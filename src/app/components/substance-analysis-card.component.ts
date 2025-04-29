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
        return this.usageHistory.filter(
            (entry) => entry.substance.toString() === this.selectedAnalysisSubstance
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
            sentiment: moodByDate[date].count > 0 ? moodByDate[date].total / moodByDate[date].count : null,
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
            craving: cravingByDate[date].count > 0 ? cravingByDate[date].total / cravingByDate[date].count : null,
        }));
    }

    prepareCombinedTrendData() {
        const usageData = this.prepareSubstanceUsageData();
        const moodData = this.prepareMoodTrendData();
        const cravingData = this.prepareCravingTrendData();

        return {
            labels: usageData.map(item => item.date),
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
}
