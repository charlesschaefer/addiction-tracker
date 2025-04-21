import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { AchievementsDisplayComponent } from "../../components/achievements-display.component";
import { AchievementDto } from "../../dto/achievement.dto";

@Component({
    selector: "app-achievements-page",
    standalone: true,
    imports: [CommonModule, AchievementsDisplayComponent],
    templateUrl: "./achievements.component.html",
})
export class AchievementsPageComponent implements OnInit {
    achievements: AchievementDto[] = [];
    loading = true;

    ngOnInit() {
        this.loadAchievements();
    }

    loadAchievements() {
        this.loading = true;
        try {
            const saved = localStorage.getItem("achievements");
            if (saved) {
                const parsed = JSON.parse(saved);
                this.achievements = parsed.map((a: any) => ({
                    ...a,
                    icon: this.getIconForCategory(a.category),
                }));
            } else {
                window.location.href = "/";
            }
        } catch {
            // handle error
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

    achievementCompleted(slice_begin: number, slice_end: number) {
        return this.achievements
            .filter((a) => !a.completed)
            .slice(slice_begin, slice_end);
    }
}
