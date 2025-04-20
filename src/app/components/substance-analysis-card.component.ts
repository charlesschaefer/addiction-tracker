import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
    selector: "app-substance-analysis-card",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./substance-analysis-card.component.html",
})
export class SubstanceAnalysisCardComponent {
    @Input() selectedAnalysisSubstance: string = "all";
    @Input() substances: string[] = [];
    @Input() COLORS: string[] = [];
    @Input() prepareUsageBySubstanceData!: () => any[];
    @Input() prepareCombinedTrendData!: () => any[];
    @Input() prepareTriggerData!: () => any[];
    @Input() setSelectedAnalysisSubstance!: (substance: string) => void;
}
