import { SafeResourceUrl } from "@angular/platform-browser";

export interface AchievementDto {
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

export type AchievementAddDto = Omit<AchievementDto, "id">;

export interface SafeIconAchievement extends AchievementDto {
    safeIcon: SafeResourceUrl
}
