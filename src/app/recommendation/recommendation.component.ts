import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { UsageDto } from '../dto/usage.dto';
import { UsageService } from '../services/usage.service';
import { RecommendationService } from '../services/recommendation.service';
import { RecommendationDto } from '../dto/recommendation.dto';

@Component({
    selector: 'app-recommendation',
    standalone: true,
    imports: [DialogModule, ButtonModule, CardModule],
    templateUrl: './recommendation.component.html',
    styleUrl: './recommendation.component.scss'
})
export class RecommendationComponent implements OnChanges {

    //@Input() usages: UsageDto[];
    @Input() trigger: string;

    recommendationText: string;
    showRecommendationDialog: boolean = false;

    constructor(
        private usageService: UsageService<UsageDto>,
        private recommendationService: RecommendationService<RecommendationDto>,
    ) {}


    async getRecommendation(trigger: string) {
        const recommendation = await this.recommendationService.fetchRecommendation(trigger);
        this.recommendationText = recommendation.text.replaceAll("\n", "<br />").replaceAll(new RegExp("\\*\\*(.*?)\\*\\*", 'g'), "<strong>$1</strong>");
        this.showRecommendationDialog = true;
    }

    ngOnChanges(changes: SimpleChanges): void {
        for (const property in changes) {
            if (property == 'trigger') {
                const updated = changes[property].currentValue;
                updated && this.getRecommendation(updated);
            }
        }
    }

    /* ngOnChanges(changes: SimpleChanges): void {
        for (const property in changes) {
            if (property == 'usages') {
                const updated = changes[property].currentValue;
                updated && this.getRecommendations(updated);
            }
        }
    }

    async getRecommendations(result: UsageDto[]) {
        let [trigger, total] = this.usageService.getMostUsedTrigger(result);
        const recommendation = await this.recommendationService.fetchRecommendation(trigger);
        this.recommendationText = recommendation.text.replaceAll("\n", "<br />").replaceAll(new RegExp("\\*\\*(.*?)\\*\\*", 'g'), "<strong>$1</strong>");
        this.showRecommendationDialog = true;
    } */

}
