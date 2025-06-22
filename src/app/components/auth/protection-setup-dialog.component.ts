import { CommonModule } from "@angular/common";
import { Component, Output, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
    selector: "app-protection-setup-dialog",
    standalone: true,
    imports: [CommonModule, FormsModule, TranslocoModule],
    templateUrl: "./protection-setup-dialog.component.html",
})
export class ProtectionSetupDialogComponent {
    @Output() closed = new EventEmitter<void>();
    step = 1;
    password = "";
    confirmPassword = "";
    error = "";

    enableProtection(_password: string) {
        // Implement actual protection logic here
    }
    disableProtection() {
        // Implement actual logic here
    }

    handleEnableProtection(event: Event) {
        event.preventDefault();
        if (this.password.length < 6) {
            this.error = "Password must be at least 6 characters long";
            return;
        }
        if (this.password !== this.confirmPassword) {
            this.error = "Passwords do not match";
            return;
        }
        this.enableProtection(this.password);
        this.close.emit();
    }

    handleSkip() {
        this.disableProtection();
        this.close.emit();
    }
}
