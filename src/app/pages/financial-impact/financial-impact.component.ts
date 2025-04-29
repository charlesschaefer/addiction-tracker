import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { UsageService } from "../../services/usage.service";
import { SubstanceService } from "../../services/substance.service";
import { UsageDto } from "../../dto/usage.dto";
import { SubstanceAddDto, SubstanceDto } from "../../dto/substance.dto";
import { FinancialImpactCardComponent } from "../../components/financial-impact-card.component";
import { CostService } from "../../services/cost.service";

@Component({
    selector: "app-financial-impact",
    standalone: true,
    imports: [CommonModule, FinancialImpactCardComponent],
    templateUrl: "./financial-impact.component.html",
})
export class FinancialImpactComponent implements OnInit {
    COLORS = ["#8B5CF6", "#F97316", "#6366F1", "#FB923C", "#A855F7", "#FDBA74"];

    usageHistory = signal<UsageDto[]>([]);
    substances = signal<Map<number, SubstanceDto>>(new Map([]));
    
    constructor(
        private usageService: UsageService,
        private substanceService: SubstanceService,
        private costService: CostService
    ) {}

    ngOnInit() {
        this.usageService.list().then((usages) => {
            this.usageHistory.set(usages as UsageDto[]);
        });
        this.substanceService.list().then((subs) => {
            this.substances.set(this.substanceService.getDataAsMap(subs, 'id') as Map<number, SubstanceDto>);
        });
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

    prepareSpendingTrendData() {
        return this.costService.prepareSpendingTrendData(this.usageHistory());
    }
}
