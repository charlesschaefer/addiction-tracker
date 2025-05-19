import { Component, Output, EventEmitter, OnInit } from "@angular/core";
import {
    AchievementsDisplayComponent,
} from "./achievements-display.component";
import { CommonModule } from "@angular/common";
import { AchievementDto } from "../../dto/achievement.dto";
import { AchievementService } from "../../services/achievement.service";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
    selector: "app-achievements-milestones",
    standalone: true,
    imports: [AchievementsDisplayComponent, CommonModule, TranslocoModule],
    templateUrl: "./achievements-milestones.component.html",
})
export class AchievementsMilestonesComponent implements OnInit {
    @Output() viewAll = new EventEmitter<void>();
    achievements: AchievementDto[] = [];
    loading = true;

    constructor(
        protected achievementService: AchievementService,
    ) {}

    ngOnInit() {
        this.loadAchievements();
    }

    getIncompleteAchievements(): AchievementDto[] {
        return this.achievements.filter((a) => !a.completed);
    }

    getCompletedAchievements(): AchievementDto[] {
        return this.achievements.filter((a) => a.completed);
    }

    loadAchievements() {
        this.loading = true;
        try {
            this.achievementService.list().then(achievements => {
                if (achievements) {
                    this.achievements = achievements as AchievementDto[];
                } else {
                    this.achievements = this.generateDefaultAchievements();
                }
            })
        } catch {
            this.achievements = this.generateDefaultAchievements();
        } finally {
            this.loading = false;
        }
    }

    getIconForCategory(category: string): string {
        switch (category) {
            case "sobriety":
                return "✔️";
            case "alternatives":
                return "💡";
            case "motivational":
                return "❤️";
            case "financial":
                return "💰";
            case "engagement":
            default:
                return "📘";
        }
    }

    generateDefaultAchievements(): AchievementDto[] {
        return [
            {
                id: 1,
                title: "First Step",
                description: "Record your first entry",
                completed: false,
                category: "engagement",
                icon: this.getIconForCategory("engagement"),
            },
            {
                id: 2,
                title: "1 Week Milestone",
                description: "Maintain 7 days of sobriety",
                completed: false,
                category: "sobriety",
                icon: this.getIconForCategory("sobriety"),
            },
            {
                id: 3,
                title: "1 Month Strong",
                description: "Maintain 30 days of sobriety",
                completed: false,
                category: "sobriety",
                icon: this.getIconForCategory("sobriety"),
            },
            {
                id: 4,
                title: "Trigger Awareness",
                description: "Identify 5 different triggers",
                completed: false,
                category: "engagement",
                icon: this.getIconForCategory("engagement"),
            },
            {
                id: 5,
                title: "3 Month Journey",
                description: "Maintain 90 days of sobriety",
                completed: false,
                category: "sobriety",
                icon: this.getIconForCategory("sobriety"),
            },
            {
                id: 6,
                title: "Alternative Explorer",
                description: "Try 3 different alternative activities",
                completed: false,
                category: "alternatives",
                icon: this.getIconForCategory("alternatives"),
            },
            {
                id: 7,
                title: "Breathing Master",
                description: "Complete 5 breathing exercises",
                completed: false,
                category: "alternatives",
                icon: this.getIconForCategory("alternatives"),
            },
            {
                id: 8,
                title: "Motivation Collector",
                description: "Add 3 motivational factors",
                completed: false,
                category: "motivational",
                icon: this.getIconForCategory("motivational"),
            },
            {
                id: 9,
                title: "Motivation Driven",
                description:
                    "Use motivational factors to avoid substance use 3 times",
                completed: false,
                category: "motivational",
                icon: this.getIconForCategory("motivational"),
            },
            {
                id: 10,
                title: "Money Saver",
                description: "Save $100 by avoiding substance use",
                completed: false,
                category: "financial",
                icon: this.getIconForCategory("financial"),
            },
            {
                id: 11,
                title: "Consistent Tracker",
                description: "Record entries for 10 consecutive days",
                completed: false,
                category: "engagement",
                icon: this.getIconForCategory("engagement"),
            },
            {
                id: 12,
                title: "Alternative Success",
                description:
                    "Successfully use alternatives 5 times to avoid substance use",
                completed: false,
                category: "alternatives",
                icon: this.getIconForCategory("alternatives"),
            },
        ];
    }
}
