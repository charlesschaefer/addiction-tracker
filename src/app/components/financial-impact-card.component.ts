import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
    selector: "app-financial-impact-card",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./financial-impact-card.component.html",
})
export class FinancialImpactCardComponent {
    @Input() calculateSpendingByPeriod!: (period: string) => number;
    @Input() calculateTotalSpending!: () => number;
    @Input() projectAnnualSpending!: () => number;
    @Input() calculatePotentialSavings!: (years: number) => number;
    @Input() prepareCostBySubstanceData!: () => {
        name: string;
        value: number;
    }[];
    @Input() COLORS: string[] = [];
}
