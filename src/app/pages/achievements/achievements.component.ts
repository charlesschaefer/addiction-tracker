import { CommonModule } from "@angular/common";
import { Component, computed, OnInit, signal } from "@angular/core";
import { AchievementsDisplayComponent } from "../../components/achivements/achievements-display.component";
import { AchievementDto, SafeIconAchievement } from "../../dto/achievement.dto";
import { AchievementService } from "../../services/achievement.service";
import { DomSanitizer } from "@angular/platform-browser";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";

@Component({
    selector: "app-achievements",
    standalone: true,
    imports: [CommonModule, AchievementsDisplayComponent, TranslocoModule],
    templateUrl: "./achievements.component.html",
})
export class AchievementsComponent implements OnInit {
    achievements = signal<AchievementDto[]>([]);
    loading = true;

    /**
     * A resource handler for fetching and processing achievements with sanitized icons.
     * 
     * This function utilizes a `resource` wrapper to manage the lifecycle of fetching 
     * and transforming achievement data into a safer format. It fetches the icons for 
     * each achievement, sanitizes them, and associates them with their respective 
     * achievements to produce a list of `SafeIconAchievement` objects.
     * 
     * @typeParam SafeIconAchievement - The type representing an achievement with a sanitized icon.
     * @typeParam AchievementDto - The type representing the raw achievement data.
     * 
     * @returns A resource object that handles the fetching and transformation of achievements.
     * 
     * ### Workflow:
     * 1. Fetches the list of achievements using the `request` function.
     * 2. Determines the appropriate fetch function (`tauriFetch` or `fetch`) based on the environment.
     * 3. Fetches the icons for each achievement asynchronously.
     * 4. Sanitizes the fetched icons using Angular's `DomSanitizer` to ensure security.
     * 5. Maps the sanitized icons back to their respective achievements.
     */
    saferAchievements = this.achievementService.getAchievementsWithIcon(this.achievements);

    /**
     * A computed property that retrieves the top three uncompleted achievements
     * from the list of safer achievements. It filters out completed achievements,
     * shuffles the achievements list and slices the first three from the resulting list.
     *
     * @returns {SafeIconAchievement[]} An array containing up to three uncompleted achievements.
     */
    achievementUncompleted = computed<SafeIconAchievement[]>(() => {
        const uncompleted = this.saferAchievements.value()?.filter((a) => !a.completed);
        console.log("Uncompleted achievements: ", uncompleted);
        console.log("Sliced Uncompleted achievements: ", uncompleted?.slice(0, 3));
        const map = uncompleted?.map(value => ({value, sort: Math.random()}));
        const sort = map?.sort((a, b) => a.sort - b.sort);
        const remap = sort?.map(({value}) => value);
        console.log("Map: ", map, "Sort:", sort, "Remap: ", remap);
        return uncompleted?.map(value => ({value, sort: Math.random()}))
            .sort((a, b) => a.sort - b.sort)
            .map(({value}) => value).slice(0, 3) as SafeIconAchievement[];
    });

    constructor(
        private achievementService: AchievementService,
        private sanitizer: DomSanitizer,
        private translateService: TranslocoService,
    ) { }

    ngOnInit() {
        this.loadAchievements();
    }

    loadAchievements() {
        this.loading = true;
        this.achievementService.list().then((achievements) => {
            this.achievements.set(achievements as AchievementDto[]);
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
}
