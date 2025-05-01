import { CommonModule } from "@angular/common";
import { Component, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "app-onboarding-flow",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./onboarding-flow.component.html",
})
export class OnboardingFlowComponent {
    @Output() complete = new EventEmitter<void>();

    currentStep = 1;
    password = "";
    confirmPassword = "";
    enableDataProtection = false;
    passwordError = "";
    //totalSteps = 8;
    totalSteps = 7;

    goToNextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
        } else {
            this.completeOnboarding();
        }
    }

    goToPreviousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    completeOnboarding() {
        if (this.enableDataProtection) {
            if (this.password.length < 6) {
                this.passwordError =
                    "Password must be at least 6 characters long";
                return;
            }
            if (this.password !== this.confirmPassword) {
                this.passwordError = "Passwords do not match";
                return;
            }
            // enableProtection(this.password); // Implement as needed
        }
        localStorage.setItem("onboardingCompleted", "true");
        this.complete.emit();
    }

    skipOnboarding() {
        localStorage.setItem("onboardingCompleted", "true");
        this.complete.emit();
    }
}
