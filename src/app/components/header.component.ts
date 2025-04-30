import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { Router, RouterModule } from "@angular/router";

import { LockButtonComponent } from "./lock-button.component";

@Component({
    selector: "app-header",
    standalone: true,
    imports: [
        CommonModule, 
        RouterModule, 
        LockButtonComponent,

    ],
    templateUrl: "./header.component.html",
})
export class HeaderComponent {
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
        { href: "/settings", label: "Security settings", icon: false },
        { href: "/settings/backup", label: "Backup", icon: false },
        { href: "/settings/sync", label: "Sync", icon: false },
        { href: "/about", label: "About", icon: false },
    ];
    settingsMenuOpen: boolean = false;

    constructor(private router: Router) {}

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    isSettingsLinkActive(link: { href: string }): boolean {
        return this.router.isActive(link.href, true);
      }
}
