import { CommonModule } from "@angular/common";
import { Component, Inject, Input, LOCALE_ID, OnInit, signal } from "@angular/core";
import { UsageService } from "../services/usage.service";
import { SubstanceService } from "../services/substance.service";
import { UsageDto } from "../dto/usage.dto";
import { SubstanceDto } from "../dto/substance.dto";
import { CostService } from "../services/cost.service";
import { ChartModule } from 'primeng/chart';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TranslocoModule } from "@jsverse/transloco";

@Component({
    selector: "app-financial-impact-card",
    standalone: true,
    imports: [CommonModule, ChartModule, TranslocoModule],
    templateUrl: "./financial-impact-card.component.html",
})
export class FinancialImpactCardComponent implements OnInit {
    @Input() calculateSpendingByPeriod!: (period:  "week" | "month" | "year" | "all") => number;
    @Input() calculateTotalSpending!: () => number;
    @Input() projectAnnualSpending!: () => number;
    @Input() calculatePotentialSavings!: (years: number) => number;
    @Input() prepareCostBySubstanceData!: () => {
        name: string;
        value: number;
    }[];
    @Input() COLORS: string[] = [];

    usageHistory = signal<UsageDto[]>([]);
    substances = signal<Map<number, SubstanceDto>>(new Map([]));

    plugins = [ChartDataLabels];

    pieOptions = {
        plugins: {
            legend: {
                position: 'right'
            },
            datalabels: {
                formatter: (value: number, _: any) => {
                    const currency = this.currentLocale == 'pt-BR' ? 'BRL' : 'USD';
                    const returnVal = Intl.NumberFormat(this.currentLocale, {currency: currency, style: 'currency'}).format(value);
                    console.log("Returned value: ", returnVal);
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
        @Inject(LOCALE_ID) private currentLocale: string,
    ) { }

    preparePieChartData() {
        const costData = this.prepareCostBySubstanceData();
        
        (this.pieOptions.plugins as any).datalabels
        return {
            labels: costData.map(item => item.name),
            datasets: [{
                data: costData.map(item => item.value),
                backgroundColor: this.COLORS,

            }]
        };
    }

    ngOnInit() {
        this.usageService.list().then((usages) => {
            this.usageHistory.set(usages as UsageDto[]);
        });
        this.substanceService.list().then((subs) => {
            this.substances.set(this.substanceService.getDataAsMap(subs, 'id') as Map<number, SubstanceDto>);
        });
    }

}
