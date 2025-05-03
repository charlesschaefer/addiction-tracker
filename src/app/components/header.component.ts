import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Router, RouterModule } from "@angular/router";
import { ThemeService } from "../services/theme.service";
import { LockButtonComponent } from "./lock-button.component";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
    selector: "app-header",
    standalone: true,
    imports: [CommonModule, RouterModule, LockButtonComponent, TranslocoModule],
    templateUrl: "./header.component.html",
})
export class HeaderComponent implements OnInit {
    mobileMenuOpen = false;
    mobileSettingsOpen: boolean = false;
    navLinks = [
        { href: "/", label: "Home", icon: false },
        { href: "/usage-entries", label: "Entries", icon: false },
        { href: "/recovery-dashboard", label: "Dashboard", icon: false },
        { href: "/triggers", label: "Triggers", icon: false },
        { href: "/financial-impact", label: "Finances", icon: false },
        //{ href: "/settings", label: "Settings", icon: true },
    ];

    settingsLinks = [
        { href: "/settings", label: "App Settings", icon: false },
        { href: "/settings/backup", label: "Backup", icon: false },
        { href: "/settings/sync", label: "Sync", icon: false },
        { href: "/about", label: "About", icon: false },
    ];
    settingsMenuOpen: boolean = false;

    theme = signal("light");

    constructor(private router: Router, public themeService: ThemeService) { }

    ngOnInit(): void {
        this.theme.set(this.themeService.getCurrentTheme()());
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
