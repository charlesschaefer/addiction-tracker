import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { UsageService } from "../../services/usage.service";
import { SubstanceService } from "../../services/substance.service";
import { UsageDto } from "../../dto/usage.dto";
import { SubstanceAddDto, SubstanceDto } from "../../dto/substance.dto";
import { FinancialImpactCardComponent } from "../../components/financial-impact-card.component";
import { CostService } from "../../services/cost.service";
import { ChartModule } from 'primeng/chart';
import { TranslocoModule } from "@jsverse/transloco";

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
            this.updateSpendingTrendChart();
        });
        this.substanceService.list().then((subs) => {
            this.substances.set(this.substanceService.getDataAsMap(subs, 'id') as Map<number, SubstanceDto>);
            this.updateSpendingTrendChart();
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

    updateSpendingTrendChart() {
        this.prepareSpendingTrendData().then(trendData => {
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

    async prepareSpendingTrendData() {
        return this.costService.prepareSpendingTrendData(this.usageHistory());
    }
}
