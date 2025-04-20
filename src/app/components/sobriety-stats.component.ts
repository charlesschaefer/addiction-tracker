import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
    selector: "app-sobriety-stats",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./sobriety-stats.component.html",
})
export class SobrietyStatsComponent {
    protected Math = Math;
    @Input() sobrietyDays = 0;
    @Input() totalEntries = 0;
    @Input() cardStyles: { default: string } = { default: "" };
}
