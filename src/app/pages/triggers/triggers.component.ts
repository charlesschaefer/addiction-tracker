import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { UsageService } from "../../services/usage.service";
import { SubstanceService } from "../../services/substance.service";
import { UsageDto } from "../../dto/usage.dto";
import { SubstanceDto } from "../../dto/substance.dto";
import { TriggerDto } from "../../dto/trigger.dto";
import { ChartModule } from "primeng/chart";
import { TriggerService } from "../../services/trigger.service";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
    selector: "app-triggers-page",
    standalone: true,
    imports: [CommonModule, ChartModule, TranslocoModule],
    templateUrl: "./triggers.component.html",
})
export class TriggersComponent implements OnInit {
    usageHistory: UsageDto[] = [];
    substances: SubstanceDto[] = [];
    selectedSubstance = "all";
    triggers: TriggerDto[] = [];
    COLORS = ["#8B5CF6", "#F97316", "#6366F1", "#FB923C", "#A855F7", "#FDBA74"];

    // Chart data
    pieChartData: any;
    barChartData: any;
    pieChartOptions: any;
    barChartOptions: any;

    constructor(
        private usageService: UsageService,
        private substanceService: SubstanceService,
        private triggerService: TriggerService
    ) {
        this.initChartOptions();
    }

    ngOnInit() {
        this.usageService.list().then((usages) => {
            this.usageHistory = usages as UsageDto[];
            this.updateCharts();
        });
        this.substanceService.list().then((subs) => {
            this.substances = subs as SubstanceDto[];
            this.updateCharts();
        });
        this.triggerService.list().then((triggers) => {
            this.triggers = triggers as TriggerDto[];
            this.updateCharts();
        });
    }

    initChartOptions() {
        // Pie chart options
        this.pieChartOptions = {
            plugins: {
                legend: {
                    position: "bottom",
                },
            },
            responsive: true,
            maintainAspectRatio: false,
        };

        // Bar chart options
        this.barChartOptions = {
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

    updateCharts() {
        this.updatePieChart();
        if (this.selectedSubstance === "all") {
            this.updateBarChart();
        }
    }

    updatePieChart() {
        const triggerData = this.prepareTriggerData();
        this.pieChartData = {
            labels: triggerData.map((item) => item.name),
            datasets: [
                {
                    data: triggerData.map((item) => item.value),
                    backgroundColor: this.COLORS,
                    hoverBackgroundColor: this.COLORS,
                },
            ],
        };
    }

    updateBarChart() {
        const triggerBySubstanceData = this.prepareTriggerBySubstanceData();

        if (this.selectedSubstance === "all") {
            // Create datasets for each substance
            const datasets = this.substances.map((substance, index) => ({
                label: substance.name,
                data: triggerBySubstanceData.map(
                    (item) => item[substance.name] || 0
                ),
                backgroundColor: this.COLORS[index % this.COLORS.length],
            }));

            this.barChartData = {
                labels: this.triggers.map((trigger) => trigger.name),
                datasets: datasets,
            };
        } else {
            // Single substance view
            const substance = this.substances.find(
                (s) => s.name === this.selectedSubstance
            );
            if (substance) {
                this.barChartData = {
                    labels: this.triggers.map((trigger) => trigger.name),
                    datasets: [
                        {
                            label: substance.name,
                            data: triggerBySubstanceData.map(
                                (item) => item[substance.name] || 0
                            ),
                            backgroundColor: this.COLORS[0],
                        },
                    ],
                };
            }
        }

        // Update bar chart options
        this.barChartOptions = {
            ...this.barChartOptions,
            plugins: {
                ...this.barChartOptions.plugins,
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            const label = context.dataset.label || "";
                            const value = context.raw || 0;
                            return `${label}: ${value} entries`;
                        },
                    },
                },
            },
        };
    }

    getFilteredUsageHistory() {
        if (this.selectedSubstance === "all") {
            return this.usageHistory;
        }
        const substance = this.substances.find(
            (s) => s.name === this.selectedSubstance
        );
        if (!substance) {
            return this.usageHistory;
        }
        return this.usageHistory.filter(
            (entry) => entry.substance === substance.id
        );
    }

    prepareTriggerData() {
        const triggerCounts: Record<string, number> = {};
        const filteredHistory = this.getFilteredUsageHistory();

        // Initialize counts for all triggers
        this.triggers.forEach((trigger) => {
            triggerCounts[trigger.name] = 0;
        });

        // Count triggers for the filtered history
        filteredHistory.forEach((entry) => {
            (entry.trigger || []).forEach((trigger) => {
                if (triggerCounts[trigger.name] !== undefined) {
                    triggerCounts[trigger.name]++;
                }
            });
        });

        // Convert to array and filter out triggers with zero count
        return Object.entries(triggerCounts)
            .filter(([_, count]) => count > 0)
            .map(([name, value]) => ({
                name,
                value,
            }));
    }

    prepareTriggerBySubstanceData() {
        const triggerBySubstance: any = {};
        this.substances.forEach((substance) => {
            triggerBySubstance[substance.name] = {};
            this.triggers.forEach((trigger) => {
                triggerBySubstance[substance.name][trigger.name] = 0;
            });
        });

        this.usageHistory.forEach((entry) => {
            const substanceName = this.substances.find(
                (s) => s.id === entry.substance
            )?.name;
            if (substanceName) {
                (entry.trigger || []).forEach((trigger) => {
                    if (
                        triggerBySubstance[substanceName] &&
                        triggerBySubstance[substanceName][trigger.name] !==
                            undefined
                    ) {
                        triggerBySubstance[substanceName][trigger.name]++;
                    }
                });
            }
        });

        return this.triggers.map((trigger) => {
            const data: any = { name: trigger.name };
            this.substances.forEach((substance) => {
                data[substance.name] =
                    triggerBySubstance[substance.name][trigger.name] || 0;
            });
            return data;
        });
    }

    setSelectedSubstance(substance: string) {
        this.selectedSubstance = substance;
        this.updateCharts();
    }

    hasTriggerData(): boolean {
        const triggerData = this.prepareTriggerData();
        return triggerData.length > 0;
    }

    hasSubstanceData(): boolean {
        if (this.selectedSubstance === "all") {
            const triggerBySubstanceData = this.prepareTriggerBySubstanceData();
            return triggerBySubstanceData.some((item) =>
                this.substances.some((substance) => item[substance.name] > 0)
            );
        }
        return false;
    }
}
