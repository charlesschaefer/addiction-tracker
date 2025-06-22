import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UsageFillingService } from "../../services/usage-filling.service";
import { UsageFillingAddDto } from "../../dto/usage-filling.dto";
import { SubstanceDto } from "../../dto/substance.dto";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";

@Component({
    selector: "app-alternative-activity-overlay",
    standalone: true,
    imports: [CommonModule, FormsModule, TranslocoModule],
    templateUrl: "./alternative-activity-overlay.component.html",
})
export class AlternativeActivityOverlayComponent {
    @Input() show = false;
    @Input() selectedSubstance?: SubstanceDto;
    @Input() motivationalFactorId?: number;
    @Output() closed = new EventEmitter<void>();
    @Output() selected = new EventEmitter<number>();
    @Output() feedback = new EventEmitter<{
        activity: any;
        wasSuccessful: boolean;
        feedback?: string;
    }>();
    @Output() giveUpUsage = new EventEmitter<void>();

    personalizedRecommendation?: { name: string; successRate: number };

    /** Whether to show the processing dialog */
    showProcessingDialog = false;
    /** Whether to show the feedback dialog */
    showFeedbackDialog = false;
    /** Currently selected activity */
    selectedActivity: any = null;
    /** Feedback message input */
    feedbackMessage = "";

    /** Whether to show the breathing exercise component */
    showBreathingExercise = false;
    /** Current breathing step (1: inhale, 2: hold, 3: exhale, 4: hold) */
    breathingStep = 1;
    /** Current breath count (out of totalBreaths) */
    currentBreath = 1;
    /** Total number of breaths for the exercise */
    totalBreaths = 5;
    /** Progress percentage for the current breathing step */
    breathingProgress = 0;
    /** Interval ID for the breathing animation timer */
    private breathingTimerId: any = null;

    /** Reference to Math for use in template */
    Math = Math;

    constructor(
        private usageFillingService: UsageFillingService,
        private translateService: TranslocoService
    ) {}

    select(activityId: number) {
        // Find the activity object from the ID (assuming it's passed from parent)
        this.selectedActivity = {
            id: activityId,
            name: this.getActivityName(activityId),
        };

        // Emit select event
        this.selected.emit(activityId);

        // Hide alternatives list
        this.show = false;

        // Check if this is a breathing exercise
        if (activityId === 1) {
            this.startBreathingExercise();
        } else {
            // Show processing dialog for other activities
            this.showProcessingDialog = true;

            // After a delay, show feedback dialog
            setTimeout(() => {
                this.showProcessingDialog = false;
                this.showFeedbackDialog = true;
            }, 3000);
        }
    }

    /**
     * Get activity name from ID
     */
    private getActivityName(id: number): string {
        const names: Record<number, string> = {
            1: "Breathing Exercise",
            2: "Drink Water",
            3: "Take a Walk",
            4: "Stretching",
            5: "Healthy Snack",
            6: "Call a Friend",
        };
        return names[id] || id.toString();
    }

    /**
     * Handle feedback submission
     */
    handleSubmitFeedback(wasSuccessful: boolean): void {
        // If the alternative activity helped and we have substance info, record that the user gave up using
        if (wasSuccessful && this.selectedSubstance) {
            // Record the usage-filling data
            const usageFilling: UsageFillingAddDto = {
                datetime: new Date(),
                substance: this.selectedSubstance.id,
                motivational_factor: this.motivationalFactorId,
                alternative_activity: this.selectedActivity
                    ? parseInt(this.selectedActivity.id)
                    : undefined,
                kept_usage: false,
            };

            // Add the record to the database
            this.usageFillingService.add(usageFilling).catch((error) => {
                console.error(
                    "Error recording alternative activity success:",
                    error
                );
            });

            // Emit the giveUpUsage event to notify parent component
            this.giveUpUsage.emit();
        }

        // Emit the feedback event
        this.feedback.emit({
            activity: this.selectedActivity,
            wasSuccessful,
            feedback: this.feedbackMessage,
        });

        // Reset and close dialogs
        this.showFeedbackDialog = false;
        this.feedbackMessage = "";
    }

    /**
     * Cancel feedback dialog
     */
    handleCancelFeedback(): void {
        this.showFeedbackDialog = false;
        this.feedbackMessage = "";
    }

    /**
     * Start the breathing exercise
     */
    startBreathingExercise(): void {
        this.showBreathingExercise = true;
        this.breathingStep = 1;
        this.currentBreath = 1;
        this.breathingProgress = 0;

        // Start the breathing animation
        this.startBreathingAnimation();
    }

    /**
     * Handle the breathing animation timing
     */
    private startBreathingAnimation(): void {
        // Clear any existing timer
        if (this.breathingTimerId) {
            clearInterval(this.breathingTimerId);
        }

        let startTime = Date.now();
        const stepDurations = {
            1: 4000, // Inhale - 4 seconds
            2: 2000, // Hold - 2 seconds
            3: 4000, // Exhale - 4 seconds
            4: 2000, // Hold - 2 seconds
        };

        // Start the interval for updating progress
        this.breathingTimerId = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const currentDuration =
                stepDurations[this.breathingStep as keyof typeof stepDurations];

            // Calculate progress percentage
            this.breathingProgress = Math.min(
                100,
                (elapsed / currentDuration) * 100
            );

            // Move to next step when current step is complete
            if (elapsed >= currentDuration) {
                this.moveToNextBreathingStep();
                startTime = Date.now();
            }
        }, 50); // Update every 50ms for smooth animation
    }

    /**
     * Move to the next breathing step
     */
    private moveToNextBreathingStep(): void {
        this.breathingStep++;

        // If we've completed a full breath cycle
        if (this.breathingStep > 4) {
            this.breathingStep = 1;
            this.currentBreath++;

            // Exercise complete after all breaths
            if (this.currentBreath > this.totalBreaths) {
                this.completeBreathingExercise();
                return;
            }
        }
    }

    /**
     * Complete the breathing exercise
     */
    completeBreathingExercise(): void {
        // Clear the timer
        if (this.breathingTimerId) {
            clearInterval(this.breathingTimerId);
            this.breathingTimerId = null;
        }

        // Hide breathing exercise
        this.showBreathingExercise = false;

        // Show feedback dialog
        this.showFeedbackDialog = true;
    }

    /**
     * Skip the breathing exercise
     */
    skipBreathingExercise(): void {
        // Clear the timer
        if (this.breathingTimerId) {
            clearInterval(this.breathingTimerId);
            this.breathingTimerId = null;
        }

        // Hide breathing exercise
        this.showBreathingExercise = false;

        // Show feedback dialog
        this.showFeedbackDialog = true;
    }

    /**
     * Get text instruction for current breathing step
     */
    getBreathingInstruction(): string {
        switch (this.breathingStep) {
            case 1:
                return this.translateService.translate("Inhale slowly through your nose...");
            case 2:
                return this.translateService.translate("Hold your breath...");
            case 3:
                return this.translateService.translate("Exhale slowly through your mouth...");
            case 4:
                return this.translateService.translate("Hold briefly...");
            default:
                return "";
        }
    }

    /**
     * Get animation class for the breathing circle
     */
    getBreathingAnimationClass(): string {
        switch (this.breathingStep) {
            case 1:
                return "animate-breathe-in";
            case 2:
                return "animate-breathe-hold";
            case 3:
                return "animate-breathe-out";
            case 4:
                return "animate-breathe-hold";
            default:
                return "";
        }
    }
}
