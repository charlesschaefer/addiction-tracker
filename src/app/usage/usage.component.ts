import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';
import { PaginatorModule } from 'primeng/paginator';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { KnobModule } from 'primeng/knob';
import { DialogModule } from 'primeng/dialog';
import { DateTime, Duration } from 'luxon';

import { UsageService } from '../services/usage.service';
import { UsageDto } from '../dto/usage.dto';
import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { PaginatedComponent, SubstanceGroupedItem } from '../util/paginated-component';
import { RecommendationService } from '../services/recommendation.service';
import { RecommendationDto } from '../dto/recommendation.dto';
import { RecommendationComponent } from '../recommendation/recommendation.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';


interface SubstanceUsage {
    name: string;
    usages: UsageDto[];
}

@Component({
    selector: 'app-usage',
    standalone: true,
    imports: [
        TableModule,
        TagModule,
        PanelModule,
        PaginatorModule,
        CardModule,
        AccordionModule,
        ToastModule,
        KnobModule,
        DialogModule,
        RecommendationComponent,
        RouterLink,
        TranslateModule
    ],
    templateUrl: './usage.component.html',
    styleUrl: './usage.component.scss',
    providers: [MessageService]
})
export class UsageComponent extends PaginatedComponent<UsageDto> implements OnInit {
    substances: Map<number, string> = new Map;
    sentiments: Map<number, string> = new Map([
        [1, '😔'],
        [2, '😟'],
        [3, '😕'],
        [4, '🙂‍'],
        [5, '😃'],
    ]);
    DateTime = DateTime;
    timeWithoutUsage: Duration;

    originalUsages: UsageDto[];

    recommendationText: string;
    showRecommendationDialog: boolean = false;

    tagSeverity:("success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined)[] = [
        'success',
        'warning',
        'info',
        'danger',
    ];

    constructor(
        private usageService: UsageService<UsageDto>,
        private substanceService: SubstanceService<SubstanceDto>,
        private messageService: MessageService,
        private recommendationService: RecommendationService<RecommendationDto>,
        private route: Router,
        private translate: TranslateService
    ) {
        super();
    }
    
    ngOnInit(): void {
        this.substanceService.list().subscribe(substances => {
            if (!substances.length) {
                this.route.navigate(["/substance-add"]);
                return;
            }
            substances.forEach(substance => this.substances.set(substance.id, substance.name));
        });

        this.usageService.list().subscribe(usages => {
            usages.sort((a, b) => a.datetime < b.datetime ? 1 : -1);

            this.originalUsages = usages;
            this.groupUsageBySubstance(usages);

            this.initializePagination();
            this.generatePaginatedItems();

            this.calculateTimeWithoutUsage(usages);

            this.getRecommendations(usages);
        });
        
    }

    groupUsageBySubstance(usages: UsageDto[]) {
        let registeredSubstances = new Map();
        // creates an array of usage grouped by substance
        usages.forEach(usage => {
            if (!registeredSubstances.has(usage.substance)) {
                console.log("Substance", this.substances, usage);
                let substanceUsage: SubstanceGroupedItem<UsageDto> = {
                    name: this.substances.get(usage.substance as number) as unknown as string,
                    items: [usage],
                    substanceId: usage.substance
                };
                this.allItems.push(substanceUsage);
                registeredSubstances.set(usage.substance, this.allItems.length - 1);
                return;
            }
            this.allItems[registeredSubstances.get(usage.substance)].items.push(usage);
        });
    }

    calculateTimeWithoutUsage(usages: UsageDto[]) {
        let baseDate = new Date('1970-01-01');
        let lastUsage = usages.reduce((prev, curr) => {
            if (curr.datetime > prev.datetime) {
                return curr;
            }
            return prev;
        }, {
            datetime: baseDate,
            craving: 0,
            id: 0,
            quantity: 0,
            sentiment: 0,
            substance: 0,
            trigger: []
        });
        if (lastUsage.datetime == baseDate) {
            lastUsage.datetime = new Date;
        }
        
        let duration = DateTime.fromJSDate(new Date).diff(DateTime.fromJSDate(lastUsage.datetime)).rescale();
        this.timeWithoutUsage = duration;
    }

    removeUsage(id: number) {
        this.usageService.remove(id).subscribe({
            next: async value => {
                this.messageService.add({
                    severity: 'success',
                    summary: await firstValueFrom(this.translate.get('Tudo certo')),
                    detail: await firstValueFrom(this.translate.get('Consumo removido com sucesso!')),
                    life: 2000
                });
                setTimeout(() => window.location.reload(), 2000);
            },
            error: async err => {
                this.messageService.add({
                    severity: 'success',
                    summary: await firstValueFrom(this.translate.get('Erro')),
                    detail: await firstValueFrom(this.translate.get('Não foi possível remover o registro!')),
                    life: 2000
                });
            }
        })
    }

    
    async getRecommendations(result: UsageDto[]) {
        let [trigger, total] = this.usageService.getMostUsedTrigger(result);
        const recommendation = await this.recommendationService.fetchRecommendation(trigger);
        this.recommendationText = recommendation.text.replaceAll("\n", "<br />").replaceAll(new RegExp("\\*\\*(.*?)\\*\\*", 'g'), "<strong>$1</strong>");
        this.showRecommendationDialog = true;
    }
}
