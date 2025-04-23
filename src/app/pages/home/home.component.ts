import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { JoyrideService } from "ngx-joyride";
import { UsageDto } from "../../dto/usage.dto";
import { AchievementDto } from "../../dto/achievement.dto";
import { AchievementService } from "../../services/achievement.service";
import { UsageService } from "../../services/usage.service";
import { NavigationCardsComponent } from "../../components/navigation-cards.component";

import svg1 from "../../../assets/icons/usage-entries.svg";
import svg2 from "../../../assets/icons/heart.svg";
import svg3 from "../../../assets/icons/dashboard.svg";
import svg4 from "../../../assets/icons/analytics.svg";

console.log(svg1);
@Component({
    selector: "app-home",
    imports: [CommonModule, NavigationCardsComponent],
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

    cards = [
        {
            href: '/usage-entries',
            iconColor: 'purple-600',
            bgColor: 'bg-purple-100',
            gradientFrom: 'purple-600',
            gradientTo: 'orange-500',
            title: 'Usage Entries',
            description:
                'View and manage your substance usage records and track your progress over time.',
            linkText: 'View Entries',
            icon: svg1 //`/assets/icons/usage-entries.svg`
        },
        {
            href: '/motivational-factors',
            iconColor: 'orange-600',
            bgColor: 'bg-orange-100',
            gradientFrom: 'orange-600',
            gradientTo: 'red-600',
            title: 'Motivations',
            description:
                'Manage your personal motivations to stay on track with your recovery journey.',
            linkText: 'Manage Motivations',
            icon: svg2 //`/assets/icons/heart.svg`
        },
        {
            href: '/recovery-dashboard',
            iconColor: 'teal-600',
            bgColor: 'bg-teal-100',
            gradientFrom: 'teal-600',
            gradientTo: 'blue-600',
            title: 'Dashboard',
            description:
                'Visualize your recovery journey with detailed charts and analytics.',
            linkText: 'View Dashboard',
            icon: svg3 //`/assets/icons/dashboard.svg`
        },
        {
            href: '/alternative-analytics',
            iconColor: 'indigo-600',
            bgColor: 'bg-indigo-100',
            gradientFrom: 'indigo-600',
            gradientTo: 'purple-600',
            title: 'Alternatives',
            description:
                'See which alternative activities work best for you based on your data.',
            linkText: 'View Analytics',
            icon: svg4 //`/assets/icons/analytics.svg`
        },
    ];


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
