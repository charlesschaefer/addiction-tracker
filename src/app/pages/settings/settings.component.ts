import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MessageService } from "primeng/api";
import { DATABASE_NAME } from "../../app.db";
import { Dexie } from "dexie";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";

@Component({
    selector: "app-settings-page",
    standalone: true,
    imports: [CommonModule, FormsModule, TranslocoModule],
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
    clearDataConfirmed = false;
    darkMode = false;
    language = 'en';

    constructor(
        private messageService: MessageService,
        private translateService: TranslocoService
    ) {
        // Load theme and language from localStorage if available
        if (typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('theme');
            if (storedTheme) {
                this.darkMode = storedTheme === 'dark';
                this.applyTheme();
            }
            const storedLang = localStorage.getItem('language');
            if (storedLang) {
                this.language = storedLang;
            }
        }
    }

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
            Dexie.delete(DATABASE_NAME);
            localStorage.clear();
        } catch (e) {
            console.error("Error trying to delete database: ", e);
        }
    }

    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
        }
        this.applyTheme();
    }

    applyTheme() {
        if (typeof document !== 'undefined') {
            if (this.darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }

    setLanguage(lang: 'en' | 'pt-br' | 'es') {
        this.language = lang;
        if (typeof window !== 'undefined') {
            localStorage.setItem('language', lang);
        }
        this.translateService.setActiveLang(lang);
    }
}
