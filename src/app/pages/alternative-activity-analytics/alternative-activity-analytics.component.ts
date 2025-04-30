import { CommonModule } from "@angular/common";
import { Component, computed, OnInit, signal } from "@angular/core";
import { RouterModule } from "@angular/router";
import { UsageFillingCounts, UsageFillingService } from "../../services/usage-filling.service";
import { AlternativeActivityService } from "../../services/alternative-activity.service";
import { AlternativeActivityDto } from "../../dto/alternative-activity.dto";

@Component({
    selector: "app-alternative-activity-analytics",
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: "./alternative-activity-analytics.component.html",
})
export class AlternativeActivityAnalyticsComponent implements OnInit {
    alternativeActivitiesCounts = signal<UsageFillingCounts[]>([]);
    alternativeActivities: Map<number, AlternativeActivityDto> = new Map();
    loading = true;

    sortedAlternatives = computed<UsageFillingCounts[]>(() =>  {
        return [...this.alternativeActivitiesCounts()].sort(
            (a, b) => this.calculateSuccessRate(b) - this.calculateSuccessRate(a)
        );
    });
 

    totalUsed = computed<number>(() =>  {
        return this.alternativeActivitiesCounts().reduce((sum, act) => sum + act.count, 0);
    });
 

    overallSuccessRate = computed<number>(() =>  {
        const totalSuccess = this.alternativeActivitiesCounts().reduce((sum, act) => sum + act.successCount, 0);
        const total = this.totalUsed();
        return total > 0 ? (totalSuccess / total) * 100 : 0;
    });

    constructor(
        private usageFillingService: UsageFillingService,
        private alternativeActivityService: AlternativeActivityService,
    ) { }

    ngOnInit() {
        // Simulate loading from localStorage
        this.loading = true;
        this.usageFillingService.getAlternativeActivityCounts().then(counts => {
            this.alternativeActivitiesCounts.set(Array.from(counts.values()));
            
            this.alternativeActivityService.list().then(activities => {
                this.loading = false;
                this.alternativeActivities = this.alternativeActivityService.getDataAsMap(activities, 'id') as Map<number, AlternativeActivityDto>;
            });
        })
        
    }

    calculateSuccessRate(activity: UsageFillingCounts): number {
        if (!activity.count) return 0;
        return (activity.successCount / activity.count) * 100;
    }
 
}
