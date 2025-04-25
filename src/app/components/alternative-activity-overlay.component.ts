import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "app-alternative-activity-overlay",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./alternative-activity-overlay.component.html",
})
export class AlternativeActivityOverlayComponent {
    @Input() show = false;
    @Input() personalizedRecommendation?: { name: string; successRate: number };
    @Output() onClose = new EventEmitter<void>();
    @Output() onSelect = new EventEmitter<string>();

    select(activityId: string) {
        this.onSelect.emit(activityId);
    }
}
