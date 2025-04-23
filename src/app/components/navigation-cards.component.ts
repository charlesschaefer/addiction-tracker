import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

export interface NavigationCard {
    href: string;
    iconColor: string;
    bgColor: string;
    gradientFrom: string;
    gradientTo: string;
    title: string;
    description: string;
    linkText: string;
    icon: string; // Use string for emoji or SVG icon class
    safeIcon?: SafeResourceUrl
}

@Component({
    selector: "app-navigation-cards",
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: "./navigation-cards.component.html",
    styleUrl: "./navigation-cards.component.scss",
})
export class NavigationCardsComponent implements OnInit {
    constructor(
        private sanitizer: DomSanitizer,
    ) { }

    @Input() cards: NavigationCard[] = [];
    @Input() cardStyles: { interactive: string } = { interactive: "" };

    ngOnInit() {
        this.cards = this.cards.map(card => {
            card.safeIcon = this.sanitizer.bypassSecurityTrustHtml(card.icon);
            return card;
        });
    }
}
