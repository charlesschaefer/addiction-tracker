import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";

export interface Achievement {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    category:
        | "sobriety"
        | "engagement"
        | "alternatives"
        | "motivational"
        | "financial";
    icon?: string; // Use string for icon class or emoji for Angular
}

@Component({
    selector: "app-achievements-display",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./achievements-display.component.html",
})
export class AchievementsDisplayComponent {
    @Input() achievements: Achievement[] = [];
    @Output() viewAll = new EventEmitter<void>();

    selectedCategory: string = "all";
    expanded = false;

    categories = [
        { id: "all", name: "All", color: "bg-purple-100 text-purple-700" },
        {
            id: "sobriety",
            name: "Sobriety",
            color: "bg-teal-100 text-teal-700",
        },
        {
            id: "alternatives",
            name: "Alternatives",
            color: "bg-blue-100 text-blue-700",
        },
        {
            id: "motivational",
            name: "Motivational",
            color: "bg-orange-100 text-orange-700",
        },
        {
            id: "engagement",
            name: "Engagement",
            color: "bg-indigo-100 text-indigo-700",
        },
        {
            id: "financial",
            name: "Financial",
            color: "bg-green-100 text-green-700",
        },
    ];

    get filteredAchievements(): Achievement[] {
        if (this.selectedCategory === "all") return this.achievements;
        return this.achievements.filter(
            (a) => a.category === this.selectedCategory
        );
    }

    get displayedAchievements(): Achievement[] {
        if (this.expanded) return this.filteredAchievements;
        return [
            ...this.filteredAchievements.filter((a) => a.completed),
            ...this.filteredAchievements
                .filter((a) => !a.completed)
                .slice(0, 3),
        ];
    }

    get completedCount(): number {
        return this.achievements.filter((a) => a.completed).length;
    }

    get totalCount(): number {
        return this.achievements.length;
    }

    get progressPercentage(): number {
        return this.totalCount === 0
            ? 0
            : Math.round((this.completedCount / this.totalCount) * 100);
    }

    setCategory(cat: string) {
        this.selectedCategory = cat;
        this.expanded = false;
    }

    toggleExpanded() {
        this.expanded = !this.expanded;
    }

    onViewAllClick() {
        this.viewAll.emit();
    }
}
