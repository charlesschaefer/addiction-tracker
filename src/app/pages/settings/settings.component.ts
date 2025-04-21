import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
    selector: "app-settings-page",
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: "./settings.component.html",
})
export class SettingsComponent {
    isProtected = false;
    password = "";
    newPassword = "";
    confirmPassword = "";
    currentPassword = "";
    error = "";
    success = "";
    showChangePassword = false;

    enableProtection(password: string) {
        this.isProtected = true;
        this.success = "Password protection enabled successfully";
        this.error = "";
        this.password = password;
    }
    disableProtection() {
        this.isProtected = false;
        this.success = "Password protection disabled successfully";
        this.error = "";
        this.password = "";
    }
    handleEnableProtection(event: Event) {
        event.preventDefault();
        this.error = "";
        this.success = "";
        if (this.newPassword.length < 6) {
            this.error = "Password must be at least 6 characters long";
            return;
        }
        if (this.newPassword !== this.confirmPassword) {
            this.error = "Passwords do not match";
            return;
        }
        this.enableProtection(this.newPassword);
        this.newPassword = "";
        this.confirmPassword = "";
        this.showChangePassword = false;
    }
    handleDisableProtection(event: Event) {
        event.preventDefault();
        this.error = "";
        this.success = "";
        if (this.currentPassword !== this.password) {
            this.error = "Current password is incorrect";
            return;
        }
        this.disableProtection();
        this.currentPassword = "";
    }
    handleChangePassword(event: Event) {
        event.preventDefault();
        this.error = "";
        this.success = "";
        if (this.currentPassword !== this.password) {
            this.error = "Current password is incorrect";
            return;
        }
        if (this.newPassword.length < 6) {
            this.error = "New password must be at least 6 characters long";
            return;
        }
        if (this.newPassword !== this.confirmPassword) {
            this.error = "New passwords do not match";
            return;
        }
        this.enableProtection(this.newPassword);
        this.success = "Password changed successfully";
        this.currentPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";
        this.showChangePassword = false;
    }
}
