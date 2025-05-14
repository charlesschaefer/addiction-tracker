import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Router, RouterModule } from "@angular/router";
import { ThemeService } from "../services/theme.service";
import { LockButtonComponent } from "./lock-button.component";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";

interface AppMenuItem {
    href: string;
    label: string;
    icon: boolean;
}

@Component({
    selector: "app-header",
    standalone: true,
    imports: [CommonModule, RouterModule, LockButtonComponent, TranslocoModule],
    templateUrl: "./header.component.html",
})
export class HeaderComponent implements OnInit {
    mobileMenuOpen = false;
    mobileSettingsOpen: boolean = false;

    navLinks: AppMenuItem[] = [];
    settingsLinks: AppMenuItem[] = [];
    
    settingsMenuOpen: boolean = false;

    theme = signal("light");

    constructor(
        private router: Router, 
        public themeService: ThemeService,
        private translateService: TranslocoService,
    ) { }

    ngOnInit(): void {
        this.theme.set(this.themeService.getCurrentTheme()());
        // Initialize navLinks and settingsLinks with translations only after the translation is loaded
        this.translateService.selectTranslate("About").subscribe(translation => {
            this.navLinks = [
                { href: "/", label: this.translateService.translate("Home"), icon: false },
                { href: "/usage-entries", label: this.translateService.translate("Entries"), icon: false },
                { href: "/recovery-dashboard", label: this.translateService.translate("Dashboard"), icon: false },
                { href: "/triggers", label: this.translateService.translate("Triggers"), icon: false },
                { href: "/financial-impact", label: this.translateService.translate("Finances"), icon: false },
                //{ href: "/settings", label: this.translateService.translate("Settings"), icon: true },
            ];

            this.settingsLinks = [
                { href: "/settings", label: this.translateService.translate("App Settings"), icon: false },
                { href: "/settings/backup", label: this.translateService.translate("Backup"), icon: false },
                { href: "/settings/sync", label: this.translateService.translate("Sync"), icon: false },
                { href: "/about", label: this.translateService.translate("About"), icon: false },
            ];
        })
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    isSettingsLinkActive(link: { href: string }): boolean {
        return this.router.isActive(link.href, true);
    }

    toggleTheme() {
        this.themeService.switchTheme();
    }

    isDarkMode() {
        return this.themeService.getCurrentTheme()() === "dark";
    }
}
