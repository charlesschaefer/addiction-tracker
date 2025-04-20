import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
    selector: "app-sobriety-tracker-card",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./sobriety-tracker-card.component.html",
})
export class SobrietyTrackerCardComponent {
    protected Math = Math;
    @Input() sobrietyDays = 0;
    @Input() totalEntries = 0;
}
