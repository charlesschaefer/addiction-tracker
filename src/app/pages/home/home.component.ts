import { CommonModule } from "@angular/common";
import { Component, OnInit, signal } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { JoyrideService } from "ngx-joyride";
import { UsageService } from "../../services/usage.service";
import { MotivationalFactorService } from "../../services/motivational-factor.service";
import { UsageDto } from "../../dto/usage.dto";
import { MotivationalFactorDto } from "../../dto/motivational-factor.dto";
import { AchievementDto } from "../../dto/achievement.dto";
import { AchievementService } from "../../services/achievement.service";
import { NavigationCardsComponent } from "../../components/navigation-cards.component";
import { AchievementsMilestonesComponent } from "../../components/achievements-milestones.component";
import { RecordSubstanceUseComponent } from "../../components/record-substance-use.component";
import { SubstanceService } from "../../services/substance.service";
import { SubstanceDto } from "../../dto/substance.dto";
import { AlternativeActivityOverlayComponent } from "../../components/alternative-activity-overlay.component";

import svg1 from "../../../assets/icons/usage-entries.svg";
import svg2 from "../../../assets/icons/heart.svg";
import svg3 from "../../../assets/icons/dashboard.svg";
import svg4 from "../../../assets/icons/analytics.svg";

@Component({
    selector: "app-home",
    imports: [
        CommonModule,
        NavigationCardsComponent,
        AchievementsMilestonesComponent
    ],
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit {
    

    usageHistory: UsageDto[] = [];
    motivationalFactors: MotivationalFactorDto[] = [];
    achievements: AchievementDto[] = [];
    

    showBreathingPrompt = false;

    cards = [
        {
            href: "/usage-entries",
            iconColor: "text-purple-600",
            bgColor: "bg-purple-100",
            gradientFrom: "from-purple-600",
            gradientTo: "to-orange-500",
            title: "Usage Entries",
            description:
                "View and manage your substance usage records and track your progress over time.",
            linkText: "View Entries",
            icon: svg1, //`/assets/icons/usage-entries.svg`
        },
        {
            href: "/motivational-factors",
            iconColor: "text-orange-600",
            bgColor: "bg-orange-100",
            gradientFrom: "from-orange-600",
            gradientTo: "to-red-600",
            title: "Motivations",
            description:
                "Manage your personal motivations to stay on track with your recovery journey.",
            linkText: "Manage Motivations",
            icon: svg2, //`/assets/icons/heart.svg`
        },
        {
            href: "/recovery-dashboard",
            iconColor: "text-teal-600",
            bgColor: "bg-teal-100",
            gradientFrom: "from-teal-600",
            gradientTo: "to-blue-600",
            title: "Dashboard",
            description:
                "Visualize your recovery journey with detailed charts and analytics.",
            linkText: "View Dashboard",
            icon: svg3, //`/assets/icons/dashboard.svg`
        },
        {
            href: "/alternative-analytics",
            iconColor: "text-indigo-600",
            bgColor: "bg-indigo-100",
            gradientFrom: "from-indigo-600",
            gradientTo: "to-purple-600",
            title: "Alternatives",
            description: "See which alternative activities work best for you based on your data.",
            linkText: "View Analytics",
            icon: svg4, //`/assets/icons/analytics.svg`
        },
    ];


    constructor(
        private joyrideService: JoyrideService,
        private cookieService: CookieService,
        private achievementService: AchievementService,
        private substanceService: SubstanceService,
        private usageService: UsageService,
        private motivationalFactorService: MotivationalFactorService
    ) {}

    ngOnInit(): void {
        const sawGuidedTour = this.cookieService.get("sawGuidedTour");
        if (!sawGuidedTour) {
            this.initializeGuidedTour();
        }

        this.achievementService.list().then((achievements) => {
            this.achievements = achievements as AchievementDto[];
        });

        this.usageService.list().then((usages) => {
            this.usageHistory = usages as UsageDto[];
        });

        this.motivationalFactorService.list().then((factors) => {
            this.motivationalFactors = factors as MotivationalFactorDto[];
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

    calculateSobrietyDays(usageHistory: any): number {
        return 0;
    }

    navigateToAchievements() {
        throw new Error("Method not implemented.");
    }

    
}
