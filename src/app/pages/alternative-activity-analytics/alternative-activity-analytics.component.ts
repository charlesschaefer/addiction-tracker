import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";

interface AlternativeActivity {
    id: number;
    name: string;
    count: number;
    successCount: number;
    failCount: number;
}

@Component({
    selector: "app-alternative-activity-analytics",
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: "./alternative-activity-analytics.component.html",
})
export class AlternativeActivityAnalyticsComponent implements OnInit {
    alternativeActivities: AlternativeActivity[] = [];
    loading = true;

    ngOnInit() {
        // Simulate loading from localStorage
        const saved = localStorage.getItem("alternativeActivities");
        if (saved) {
            this.alternativeActivities = JSON.parse(saved);
        }
        this.loading = false;
    }

    calculateSuccessRate(activity: AlternativeActivity): number {
        if (!activity.count) return 0;
        return (activity.successCount / activity.count) * 100;
    }

    get sortedAlternatives(): AlternativeActivity[] {
        return [...this.alternativeActivities].sort(
            (a, b) => this.calculateSuccessRate(b) - this.calculateSuccessRate(a)
        );
    }

    get totalUsed(): number {
        return this.alternativeActivities.reduce((sum, act) => sum + act.count, 0);
    }

    get overallSuccessRate(): number {
        const totalSuccess = this.alternativeActivities.reduce((sum, act) => sum + act.successCount, 0);
        const total = this.totalUsed;
        return total > 0 ? (totalSuccess / total) * 100 : 0;
    }
}
