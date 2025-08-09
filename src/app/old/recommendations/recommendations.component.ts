import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { JoyrideModule } from 'ngx-joyride';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { TriggerService } from '../../services/trigger.service';
import { TriggerDto } from '../../dto/trigger.dto';
import { RecommendationComponent } from '../recommendation/recommendation.component';


@Component({
    selector: 'app-recommendations',
    standalone: true,
    imports: [
        ButtonModule,
        TableModule,
        PanelModule,
        NgComponentOutlet,
        RecommendationComponent,
        CommonModule,
        JoyrideModule,
        TranslocoModule,
    ],
    templateUrl: './recommendations.component.html',
    styleUrl: './recommendations.component.scss'
})
export class RecommendationsComponent implements OnInit {
    private triggerService = inject(TriggerService);
    private translateService = inject(TranslocoService);


    triggers: TriggerDto[];
    trigger: string;

    ngOnInit(): void {
        this.triggerService.list().then(triggers => {
            this.triggers = triggers as TriggerDto[];
        });
    }

    showRecommendation(trigger: string) {
        this.trigger = trigger;
    }

}
