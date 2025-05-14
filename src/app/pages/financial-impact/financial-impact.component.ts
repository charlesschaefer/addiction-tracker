import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { UsageService } from "../../services/usage.service";
import { SubstanceService } from "../../services/substance.service";
import { UsageDto } from "../../dto/usage.dto";
import { SubstanceAddDto, SubstanceDto } from "../../dto/substance.dto";
import { FinancialImpactCardComponent } from "../../components/financial-impact-card/financial-impact-card.component";
import { CostService } from "../../services/cost.service";
import { ChartModule } from 'primeng/chart';
import { TranslocoModule } from "@jsverse/transloco";
import { CostDto } from "../../dto/cost.dto";

@Component({
    selector: "app-financial-impact",
    standalone: true,
    imports: [CommonModule, FinancialImpactCardComponent, ChartModule, TranslocoModule],
    templateUrl: "./financial-impact.component.html",
})
export class FinancialImpactComponent implements OnInit {
    COLORS = ["#8B5CF6", "#F97316", "#6366F1", "#FB923C", "#A855F7", "#FDBA74"];

    usageHistory = signal<UsageDto[]>([]);
    substances = signal<Map<number, SubstanceDto>>(new Map([]));

    // Chart data
    spendingTrendData: any;
    spendingTrendOptions: any;

    // New: Store cost table data
    costs = signal<any[]>([]);

    constructor(
        private usageService: UsageService,
        private substanceService: SubstanceService,
        private costService: CostService
    ) {
        this.initChartOptions();
    }

    ngOnInit() {
        // Fetch all costs from the cost table
        this.costService.list().then((costs) => {
            this.costs.set(costs);
            this.updateSpendingTrendChart(costs as CostDto[]);
        });
        this.substanceService.list().then((subs) => {
            this.substances.set(this.substanceService.getDataAsMap(subs, 'id') as Map<number, SubstanceDto>);
            this.updateSpendingTrendChart(this.costs());
        });
        // Usage history is still fetched for other purposes if needed
        this.usageService.list().then((usages) => {
            this.usageHistory.set(usages as UsageDto[]);
        });
    }

    initChartOptions() {
        this.spendingTrendOptions = {
            plugins: {
                legend: {
                    display: false
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        };
    }

    updateSpendingTrendChart(costs: CostDto[]) {
        this.prepareSpendingTrendData(costs).then(trendData => {
            if (trendData.length > 0) {
                this.spendingTrendData = {
                    labels: trendData.map(item => {
                        const date = new Date(item.date);
                        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                    }),
                    datasets: [{
                        label: 'Daily Spending',
                        data: trendData.map(item => item.spending),
                        fill: true,
                        borderColor: '#8B5CF6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.4
                    }]
                };
            }
        });
    }

    hasSpendingTrendData(): boolean {
        const trendData = this.spendingTrendData?.datasets[0]?.data || [];
        // Check if the trendData array has any data points 
        return trendData.length > 0;
    }

    prepareCostBySubstanceData(costs: CostDto[]) {
        // Use cost table data instead of usageHistory
        return this.costService.prepareCostBySubstanceDataFromCosts(costs, this.substances());
    }

    calculateTotalSpending(costs: CostDto[]): number {
        return this.costService.calculateTotalSpendingFromCosts(costs);
    }

    calculateSpendingByPeriod(period: "week" | "month" | "year" | "all" = "all", costs: CostDto[]): number {
        return this.costService.calculateSpendingByPeriodFromCosts(costs, period);
    }

    projectAnnualSpending(costs: CostDto[]): number {
        return this.costService.projectAnnualSpendingFromCosts(costs);
    }

    calculatePotentialSavings(years: number, costs: CostDto[]): number {
        return this.costService.calculatePotentialSavingsFromCosts(costs, years);
    }

    calculateInvestmentGrowth(years: number, interestRate = 0.07, costs: CostDto[]): number {
        return this.costService.calculateInvestmentGrowthFromCosts(costs, years, interestRate);
    }

    async prepareSpendingTrendData(costs: CostDto[]) {
        return this.costService.prepareSpendingTrendDataFromCosts(costs);
    }
}
