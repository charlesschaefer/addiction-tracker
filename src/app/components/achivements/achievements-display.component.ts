import { CommonModule } from "@angular/common";
import { Component,Output, EventEmitter, input, effect, computed, signal, resource } from "@angular/core";
import { AchievementDto, SafeIconAchievement } from "../../dto/achievement.dto";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { AchievementService } from "../../services/achievement.service";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
    selector: "app-achievements-display",
    standalone: true,
    imports: [CommonModule, RouterLink, ButtonModule, RouterLinkActive, TranslocoModule],
    templateUrl: "./achievements-display.component.html",
})
export class AchievementsDisplayComponent {
    achievements = input<AchievementDto[]>([]);
    @Output() viewAll = new EventEmitter<void>();

    //saferAchievements = signal<SafeIconAchievement[]>([]);

    selectedCategory = signal<string>("all");
    expanded = signal<boolean>(false);

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
     * A computed property that filters and sorts achievements based on their completion status
     * and the selected category.
     *
     * - Achievements are sorted such that completed ones appear first.
     * - If the selected category is "all", all achievements are returned.
     * - Otherwise, only achievements matching the selected category are included.
     *
     * @returns An array of `SafeIconAchievement` objects that match the selected criteria.
     */
    filteredAchievements = computed<SafeIconAchievement[]>(() => {
        const achievements = (this.saferAchievements.value()?.sort((a, b) => a.completed ? -1 : 1) || []) as SafeIconAchievement[];
        if (this.selectedCategory() === "all") return achievements;
        return achievements.filter(
            (a) => a.category === this.selectedCategory()
        );
    });

    /**
     * A computed property that returns a list of achievements to be displayed.
     * 
     * - If the `expanded` state is true, all filtered achievements are returned.
     * - Otherwise, it prioritizes completed achievements and includes up to 4 achievements
     *   in total, filling the remaining slots with incomplete achievements if necessary.
     * 
     * @returns An array of `SafeIconAchievement` objects representing the displayed achievements.
     */
    displayedAchievements = computed<SafeIconAchievement[]>(() => {
        if (this.expanded()) return this.filteredAchievements();
        const completed = this.filteredAchievements().filter((a) => a.completed);
        return [
            ...completed,
            ...this.filteredAchievements()
                .filter((a) => !a.completed)
                .slice(0, (5 - completed.length) <= 0 ? 0 : 4 - completed.length),
        ];
    });

    /**
     * A computed property that calculates the total number of completed achievements.
     * It filters the `saferAchievements` array to include only those achievements
     * marked as completed and returns the count of such achievements.
     *
     * @returns {number} The total count of completed achievements.
     */
    completedCount = computed<number>(() => {
        const completed = this.saferAchievements.value()?.filter((a) => a.completed) as SafeIconAchievement[];
        return completed?.length;
    });

    /**
     * A computed property that calculates the total number of achievements.
     * It retrieves the list of achievements from `saferAchievements` and
     * returns the count of items in the list.
     *
     * @returns The total number of achievements as a number.
     */
    totalCount = computed<number>(() => {
        const totalAchievements = this.saferAchievements.value() as SafeIconAchievement[];
        return totalAchievements?.length;
    });

    /**
     * A computed property that calculates the progress percentage based on the ratio
     * of completed items to the total count of items. If the total count is zero,
     * the progress percentage is set to 0 to avoid division by zero.
     *
     * @returns {number} The progress percentage as an integer between 0 and 100.
     */
    progressPercentage = computed<number>(() => {
        return this.totalCount() === 0
            ? 0
            : Math.round((this.completedCount() / this.totalCount()) * 100);
    });


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

    constructor(
        private sanitizer: DomSanitizer,
        private achievementService: AchievementService,
    ) { }

    setCategory(cat: string) {
        this.selectedCategory.set(cat);
        this.expanded.set(false);
    }

    toggleExpanded() {
        this.expanded.update(expanded => !expanded);
    }

    onViewAllClick() {
        this.viewAll.emit();
    }
}
