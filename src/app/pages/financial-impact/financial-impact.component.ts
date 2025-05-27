import { CommonModule } from "@angular/common";
import { Component, Inject, LOCALE_ID, OnInit, signal } from "@angular/core";
import { UsageService } from "../../services/usage.service";
import { SubstanceService } from "../../services/substance.service";
import { UsageDto } from "../../dto/usage.dto";
import { SubstanceDto } from "../../dto/substance.dto";
import { FinancialImpactCardComponent } from "../../components/financial-impact-card/financial-impact-card.component";
import { CostService } from "../../services/cost.service";
import { ChartModule } from 'primeng/chart';
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { CostDto } from "../../dto/cost.dto";
import { DateTime } from "luxon";

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
        private costService: CostService,
        private translateService: TranslocoService
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
                    beginAtZero: !true
                }
            }
        };
    }

    updateSpendingTrendChart(costs: CostDto[]) {
        // Convert lower case language format to something like "en-US" or "pt-BR"
        const locale = this.translateService.getActiveLang().split("-").map((value, idx) => idx === 1 ? value.toUpperCase() : value).join("-");
        this.prepareSpendingTrendData(costs).then(trendData => {
            if (trendData.length > 0) {
                this.spendingTrendData = {
                    labels: trendData.map(item => {
                        const date = DateTime.fromFormat(item.date, 'yyyy-MM-dd');
                        return date.toLocaleString(
                            {
                                day: 'numeric',
                                month: 'short'
                            }, 
                            {
                                locale: locale
                            }
                        );
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
