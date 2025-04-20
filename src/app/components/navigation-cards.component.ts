import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
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
}

@Component({
    selector: "app-navigation-cards",
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: "./navigation-cards.component.html",
})
export class NavigationCardsComponent {
    @Input() cards: NavigationCard[] = [];
    @Input() cardStyles: { interactive: string } = { interactive: "" };
}
