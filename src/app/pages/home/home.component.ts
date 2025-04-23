import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { JoyrideService } from "ngx-joyride";
import { UsageDto } from "../../dto/usage.dto";
import { AchievementDto } from "../../dto/achievement.dto";
import { AchievementService } from "../../services/achievement.service";
import { UsageService } from "../../services/usage.service";

@Component({
    selector: "app-home",
    imports: [CommonModule],
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit {
    showRecordPopup = false;
    showMotivationalFactors = false;
    showMotivationalPrompt = false;

    usageHistory: UsageDto[] = [];
    achievements: AchievementDto[] = [];

    currentMotivationalFactor: any = null;


    constructor(
        private joyrideService: JoyrideService,
        private cookieService: CookieService,
        private achievementService: AchievementService,
        private usageService: UsageService,
    ) {}

    ngOnInit(): void {
        const sawGuidedTour = this.cookieService.get("sawGuidedTour");
        if (!sawGuidedTour) {
            this.initializeGuidedTour();
        }

        this.achievementService.list().then((achievements) => {
            this.achievements = achievements as AchievementDto[];
        });
    }

    initializeGuidedTour() {
        this.joyrideService
            .startTour({
                steps: [
                    "firstStep",
                    "substanceAdd@substance-add",
                    "dialMenu",
                    "usageAdd@usage-add",
                    "triggerAdd@usage-add",
                    "usageTrack@usage-track",
                    "costAdd@cost-add",
                    "recommendations@recommendations",
                    "substanceAddStart@substance-add",
                ],
            })
            .subscribe({
                complete: () => {
                    this.cookieService.set("sawGuidedTour", "1");
                },
            });
    }

    handleMotivationalFeedback(feedback: any) {
        /* ... */
    }
    handleSubmit() {
        /* ... */
    }
    setShowRecordPopup(val: boolean) {
        this.showRecordPopup = val;
    }
    setShowMotivationalFactors(val: boolean) {
        this.showMotivationalFactors = val;
    }

    onAddRecordClick() {
        throw new Error("Method not implemented.");
    }

    calculateSobrietyDays(usageHistory: any): number {
        return 0;
    }
}
