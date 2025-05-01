import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
    selector: "app-sobriety-stats",
    standalone: true,
    imports: [CommonModule, TranslocoModule],
    templateUrl: "./sobriety-stats.component.html",
})
export class SobrietyStatsComponent {
    protected Math = Math;
    @Input() sobrietyDays = 0;
    @Input() totalEntries = 0;
    @Input() cardStyles: { default: string } = { default: "" };
}
