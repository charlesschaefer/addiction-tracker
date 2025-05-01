import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
    selector: "app-sobriety-tracker-card",
    standalone: true,
    imports: [CommonModule, TranslocoModule],
    templateUrl: "./sobriety-tracker-card.component.html",
})
export class SobrietyTrackerCardComponent {
    protected Math = Math;
    @Input() sobrietyDays = 0;
    @Input() totalEntries = 0;
}
