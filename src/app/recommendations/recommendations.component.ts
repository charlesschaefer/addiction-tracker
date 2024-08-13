import { Component, OnInit } from '@angular/core';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { JoyrideModule } from 'ngx-joyride';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { TriggerService } from '../services/trigger.service';
import { TriggerDto } from '../dto/trigger.dto';
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
        TranslateModule,
    ],
    templateUrl: './recommendations.component.html',
    styleUrl: './recommendations.component.scss'
})
export class RecommendationsComponent implements OnInit {

    triggers: TriggerDto[];
    trigger: string;
    
    constructor(
        private triggerService: TriggerService<TriggerDto>,
        private translate: TranslateService,
    ) {}

    ngOnInit(): void {
        this.triggerService.list().subscribe(triggers => {
            this.triggers = triggers;
        });
    }

    showRecommendation(trigger: string) {
        this.trigger = trigger;
    }

}
