import { Component, Input, inject } from "@angular/core";
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
    private usageService = inject(UsageService);
    private translocoService = inject(TranslocoService);

    @Input() componentStyle = SobrietyCardStyle.SIMPLE_DAYS;
    @Input() usageHistory: UsageDto[] = [];
    @Input() useCache = true;

    styles = SobrietyCardStyle;

    calculateSobrietyDays(): number {
        return this.usageService.calculateSobrietyDays(this.usageHistory, this.useCache);
    }
}
