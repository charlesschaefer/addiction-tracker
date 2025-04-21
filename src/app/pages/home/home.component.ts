import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { JoyrideService } from "ngx-joyride";

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

    usageHistory: any[] = [];
    achievements: any[] = [
        { id: 1, title: 'First Step', description: 'Record your first entry', completed: false },
        {
            id: 2,
            title: '1 Week Milestone',
            description: 'Maintain 7 days of sobriety',
            completed: true,
        },
        {
            id: 3,
            title: '1 Month Strong',
            description: 'Maintain 30 days of sobriety',
            completed: false,
        },
        {
            id: 4,
            title: 'Trigger Awareness',
            description: 'Identify 5 different triggers',
            completed: true,
        },
        {
            id: 5,
            title: '3 Month Journey',
            description: 'Maintain 90 days of sobriety',
            completed: false,
        },
    ];

    currentMotivationalFactor: any = null;


    constructor(
        private joyrideService: JoyrideService,
        private cookieService: CookieService
    ) {}

    ngOnInit(): void {
        const sawGuidedTour = this.cookieService.get("sawGuidedTour");
        if (!sawGuidedTour) {
            this.initializeGuidedTour();
        }
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
