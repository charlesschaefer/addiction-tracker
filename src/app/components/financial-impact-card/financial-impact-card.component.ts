import { CommonModule } from "@angular/common";
import { Component, Inject, Input, LOCALE_ID, OnInit, signal } from "@angular/core";
import { UsageService } from "../../services/usage.service";
import { SubstanceService } from "../../services/substance.service";
import { CostService } from "../../services/cost.service";
import { ChartModule } from 'primeng/chart';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { CostDto } from "../../dto/cost.dto";
import { SubstanceDto } from "../../dto/substance.dto";
import { getCurrency } from "locale-currency";

@Component({
    selector: "app-financial-impact-card",
    standalone: true,
    imports: [CommonModule, ChartModule, TranslocoModule],
    templateUrl: "./financial-impact-card.component.html",
})
export class FinancialImpactCardComponent implements OnInit {
    @Input() COLORS: string[] = [];
    @Input() usageCosts!: CostDto[];
    @Input('substances') allSubstances: Map<number, SubstanceDto>;
    @Input() parent: any;

    // Signals for all calculated/prepared values
    costs = signal<CostDto[]>([]);
    substances = signal<Map<number, SubstanceDto>>(new Map());
    spendingByWeek = signal<number>(0);
    spendingByMonth = signal<number>(0);
    spendingByYear = signal<number>(0);
    spendingAll = signal<number>(0);
    totalSpending = signal<number>(0);
    projectedAnnual = signal<number>(0);
    potentialSavings1 = signal<number>(0);
    potentialSavings5 = signal<number>(0);
    potentialSavings10 = signal<number>(0);
    costBySubstance = signal<{ name: string, value: number }[]>([]);
    pieChartData = signal<any>(null);

    plugins = [ChartDataLabels];

    pieOptions = {
        plugins: {
            legend: {
                position: 'right'
            },
            datalabels: {
                formatter: (value: number, _: any) => {
                    const locale = this.translateService.getActiveLang().split("-").map((value, idx) => idx === 1 ? value.toUpperCase() : value).join("-");
                    const currency = getCurrency(locale) || 'USD';
                    const returnVal = Intl.NumberFormat(locale, {currency: currency, style: 'currency'}).format(value);
                    return returnVal;
                },
                anchor: 'end',
                align: 'end'
            }
        }
    };

    constructor(
        private usageService: UsageService,
        private substanceService: SubstanceService,
        private costService: CostService,
        private translateService: TranslocoService,
    ) { }

    ngOnInit() {
        // Load costs and substances if not provided
        if (this.usageCosts && this.usageCosts.length > 0) {
            this.costs.set(this.usageCosts);
        } else {
            this.costService.list().then((costs) => {
                this.costs.set(costs as CostDto[]);
                this.calculateAll();
            });
        }
        if (this.allSubstances && this.allSubstances.size > 0) {
            this.substances.set(this.allSubstances);
        } else {
            this.substanceService.list().then((subs) => {
                this.substances.set(this.substanceService.getDataAsMap(subs, 'id') as Map<number, SubstanceDto>);
                this.calculateAll();
            });
        }
        // If both were provided as inputs, calculate immediately
        if ((this.usageCosts && this.usageCosts.length > 0) && (this.allSubstances && this.allSubstances.size > 0)) {
            this.calculateAll();
        }
    }

    private calculateAll() {
        const costs = this.costs();
        const substances = this.substances();

        this.spendingByWeek.set(this.costService.calculateSpendingByPeriodFromCosts(costs, 'week'));
        this.spendingByMonth.set(this.costService.calculateSpendingByPeriodFromCosts(costs, 'month'));
        this.spendingByYear.set(this.costService.calculateSpendingByPeriodFromCosts(costs, 'year'));
        this.spendingAll.set(this.costService.calculateSpendingByPeriodFromCosts(costs, 'all'));
        this.totalSpending.set(this.costService.calculateTotalSpendingFromCosts(costs));
        this.projectedAnnual.set(this.costService.projectAnnualSpendingFromCosts(costs));
        this.potentialSavings1.set(this.costService.calculatePotentialSavingsFromCosts(costs, 1));
        this.potentialSavings5.set(this.costService.calculatePotentialSavingsFromCosts(costs, 5));
        this.potentialSavings10.set(this.costService.calculatePotentialSavingsFromCosts(costs, 10));
        const costBySub = this.costService.prepareCostBySubstanceDataFromCosts(costs, substances);
        this.costBySubstance.set(costBySub);
        this.pieChartData.set({
            labels: costBySub.map(item => item.name),
            datasets: [{
                data: costBySub.map(item => item.value),
                backgroundColor: this.COLORS,
            }]
        });
    }
}
