import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { AchievementsDisplayComponent } from "../../components/achivements/achievements-display.component";
import { AchievementDto } from "../../dto/achievement.dto";
import { AchievementService } from "../../services/achievement.service";
import { RouterLink } from "@angular/router";

@Component({
    selector: "app-achievements",
    standalone: true,
    imports: [CommonModule, AchievementsDisplayComponent, RouterLink],
    templateUrl: "./achievements.component.html",
})
export class AchievementsComponent implements OnInit {
    achievements: AchievementDto[] = [];
    loading = true;

    constructor(private achievementService: AchievementService) {}

    ngOnInit() {
        this.loadAchievements();
    }

    loadAchievements() {
        this.loading = true;
        this.achievementService.list().then((achievements) => {
            this.achievements = (achievements as AchievementDto[]).map((a) => ({
                ...a,
                icon: this.getIconForCategory(a.category),
            }));
            this.loading = false;
        });
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

    achievementCompleted(slice_begin: number, slice_end: number) {
        return this.achievements
            .filter((a) => !a.completed)
            .slice(slice_begin, slice_end);
    }
}
