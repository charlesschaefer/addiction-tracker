import { Component, Input } from "@angular/core";
import { UsageDto } from "../../dto/usage.dto";
import { UsageService } from "../../services/usage.service";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { CommonModule } from "@angular/common";

export enum SobrietyCardStyle {
    BADGE,
    SIMPLE_DAYS,
    YEAR_COMPLETION,
}

@Component({
    selector: "app-sobriety-card",
    imports: [TranslocoModule, CommonModule],
    templateUrl: "./sobriety-card.component.html",
})
export class SobrietyCardComponent {
    @Input() componentStyle = SobrietyCardStyle.SIMPLE_DAYS;
    @Input() usageHistory: UsageDto[] = [];
    @Input() useCache = true;

    styles = SobrietyCardStyle;

    constructor(
        private usageService: UsageService,
        private translocoService: TranslocoService
    ) {}

    calculateSobrietyDays(): number {
        return this.usageService.calculateSobrietyDays(this.usageHistory, this.useCache);
    }
}
