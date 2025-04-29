import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { DATABASE_NAME } from "../../app.db";
import { Dexie } from "dexie";

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
    clearDataConfirmation = "";
    showClearDataDialog = false;
    clearDataConfirmed: boolean = false;

    constructor(
        private messageService: MessageService
    ) {}

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

    validateClearData() {
        if (this.clearDataConfirmation === 'CLEAR ALL DATA') {
            // Implement the actual data clearing logic here
            this.clearAllData();
            this.setShowClearDataDialog(false);
            this.clearDataConfirmed = false;
            this.messageService.add({
                severity: 'success',
                summary: "Success",
                detail: 'All data has been cleared successfully',
                life: 3000
            })
        } else {
            this.messageService.add({
                severity: 'error',
                summary: "Error",
                detail: 'Please type CLEAR ALL DATA exactly to confirm',
                life: 3000
            })
        }
    }
    setClearDataConfirmation(event: any) {
        if (event.value == 'CLEAR ALL DATA') {
            this.clearDataConfirmed = true;
            return;
        }
        this.clearDataConfirmed = false;
    }
    setShowClearDataDialog(show: boolean): true {
        this.showClearDataDialog = show;
        return true;
    }

    clearAllData() {
        try {
            Dexie.delete(DATABASE_NAME)
        } catch (e) {
            console.error("Error trying to delete database: ", e);
        }
    }
}
