import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { TranslocoModule } from "@jsverse/transloco";

export interface MotivationalFactor {
    type: "text" | "image" | "audio";
    content: string;
}

@Component({
    selector: "app-motivational-factor-display",
    standalone: true,
    imports: [CommonModule, TranslocoModule],
    templateUrl: "./motivational-factor-display.component.html",
})
export class MotivationalFactorDisplayComponent {
    @Input() factor!: MotivationalFactor;
    @Output() feedback = new EventEmitter<{
        motivationalImpact: string;
        emotionalImpact: string;
    }>();
    showFeedback = false;

    handleMotivationalImpact(impact: string) {
        this.feedback.emit({
            motivationalImpact: impact,
            emotionalImpact: "no_change",
        });
        this.showFeedback = false;
    }

    handleEmotionalImpact(impact: string) {
        this.feedback.emit({
            motivationalImpact: "no_change",
            emotionalImpact: impact,
        });
        this.showFeedback = false;
    }
}
