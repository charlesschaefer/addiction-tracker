import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { JoyrideService } from "ngx-joyride";
import { UsageService } from "../../services/usage.service";
import { MotivationalFactorService } from "../../services/motivational-factor.service";
import { UsageDto } from "../../dto/usage.dto";
import { MotivationalFactorDto } from "../../dto/motivational-factor.dto";
import { AchievementDto } from "../../dto/achievement.dto";
import { AchievementService } from "../../services/achievement.service";
import { NavigationCardsComponent } from "../../components/navigation-cards/navigation-cards.component";
import { AchievementsMilestonesComponent } from "../../components/achivements/achievements-milestones.component";
import { SubstanceService } from "../../services/substance.service";

import svg1 from "../../../assets/icons/usage-entries.svg";
import svg2 from "../../../assets/icons/heart.svg";
import svg3 from "../../../assets/icons/dashboard.svg";
import svg4 from "../../../assets/icons/analytics.svg";
import {
    SobrietyCardComponent,
    SobrietyCardStyle,
} from "../../components/sobriety/sobriety-card.component";
import { OnboardingFlowComponent } from "../../components/onboarding/onboarding-flow.component";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";

@Component({
    selector: "app-home",
    imports: [
        CommonModule,
        NavigationCardsComponent,
        AchievementsMilestonesComponent,
        SobrietyCardComponent,
        OnboardingFlowComponent, 
        TranslocoModule
    ],
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit {
    private joyrideService = inject(JoyrideService);
    private cookieService = inject(CookieService);
    private achievementService = inject(AchievementService);
    private substanceService = inject(SubstanceService);
    private usageService = inject(UsageService);
    private motivationalFactorService = inject(MotivationalFactorService);
    private translateService = inject(TranslocoService);

    showOnboardingFlow = true;
    usageHistory: UsageDto[] = [];
    motivationalFactors: MotivationalFactorDto[] = [];
    achievements: AchievementDto[] = [];

    showBreathingPrompt = false;

    cards: any = [];

    sobrietyComponentStyle = SobrietyCardStyle.YEAR_COMPLETION;

    ngOnInit(): void {
        this.showOnboardingFlow = !localStorage.getItem("onboardingCompleted");

        this.achievementService.list().then((achievements) => {
            this.achievements = achievements as AchievementDto[];
        });

        this.usageService.listActive().then((usages) => {
            this.usageHistory = usages as UsageDto[];
        });

        this.motivationalFactorService.list().then((factors) => {
            this.motivationalFactors = factors as MotivationalFactorDto[];
        });

        // translates the card titles and descriptions only after the translation service is ready
        // and then translates everytime the translation changes (ie. language changes)
        this.translateService.selectTranslate("Usage Entries").subscribe((_trans) => {
            this.cards = [
                {
                    href: "/usage-entries",
                    iconColor: "text-purple-600",
                    bgColor: "bg-purple-100",
                    gradientFrom: "from-purple-600",
                    gradientTo: "to-orange-500",
                    title: this.translateService.translate("Usage Entries"),
                    description:
                        this.translateService.translate("View and manage your substance usage records and track your progress over time."),
                    linkText: this.translateService.translate("View Entries"),
                    icon: svg1, //`/assets/icons/usage-entries.svg`
                },
                {
                    href: "/motivational-factors",
                    iconColor: "text-orange-600",
                    bgColor: "bg-orange-100",
                    gradientFrom: "from-orange-600",
                    gradientTo: "to-red-600",
                    title: this.translateService.translate("Motivations"),
                    description:
                        this.translateService.translate("Manage your personal motivations to stay on track with your recovery journey."),
                    linkText: this.translateService.translate("Manage Motivations"),
                    icon: svg2, //`/assets/icons/heart.svg`
                },
                {
                    href: "/recovery-dashboard",
                    iconColor: "text-teal-600",
                    bgColor: "bg-teal-100",
                    gradientFrom: "from-teal-600",
                    gradientTo: "to-blue-600",
                    title: this.translateService.translate("Dashboard"),
                    description:
                        this.translateService.translate("Visualize your recovery journey with detailed charts and analytics."),
                    linkText: this.translateService.translate("View Dashboard"),
                    icon: svg3, //`/assets/icons/dashboard.svg`
                },
                {
                    href: "/alternative-activity-analytics",
                    iconColor: "text-indigo-600",
                    bgColor: "bg-indigo-100",
                    gradientFrom: "from-indigo-600",
                    gradientTo: "to-purple-600",
                    title: this.translateService.translate("Alternatives"),
                    description:
                        this.translateService.translate("See which alternative activities work best for you based on your data."),
                    linkText: this.translateService.translate("View Analytics"),
                    icon: svg4, //`/assets/icons/analytics.svg`
                }
            ];
        });
    }

    initializeGuidedTour() {
        // this.joyrideService
        //     .startTour({
        //         steps: [
        //             "firstStep",
        //             "substanceAdd@substance-add",
        //             "dialMenu",
        //             "usageAdd@usage-add",
        //             "triggerAdd@usage-add",
        //             "usageTrack@usage-track",
        //             "costAdd@cost-add",
        //             "recommendations@recommendations",
        //             "substanceAddStart@substance-add",
        //         ],
        //     })
        //     .subscribe({
        //         complete: () => {
        //             this.cookieService.set("sawGuidedTour", "1");
        //         },
        //     });
    }

    calculateSobrietyDays(usageHistory: UsageDto[]): number {
        return this.usageService.calculateSobrietyDays(usageHistory);
    }

    navigateToAchievements() {
        throw new Error("Method not implemented.");
    }

    completeOnboarding() {
        localStorage.setItem("onboardingCompleted", "true");
        this.showOnboardingFlow = false;
        window.location.reload();
    }
}
