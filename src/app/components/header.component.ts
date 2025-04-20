import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { LockButtonComponent } from "./lock-button.component";

@Component({
    selector: "app-header",
    standalone: true,
    imports: [
        CommonModule, 
        RouterModule, 
        LockButtonComponent
    ],
    templateUrl: "./header.component.html",
})
export class HeaderComponent {
    mobileMenuOpen = false;
    navLinks = [
        { href: "/", label: "Home", icon: false },
        { href: "/usage-entries", label: "Entries", icon: false },
        { href: "/recovery-dashboard", label: "Dashboard", icon: false },
        { href: "/triggers", label: "Triggers", icon: false },
        { href: "/financial-impact", label: "Finances", icon: false },
        { href: "/settings", label: "Settings", icon: true },
    ];

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }
}
