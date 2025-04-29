import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';


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
        FormsModule,
        RouterLink,
        TranslocoModule
    ],
    templateUrl: './usage.component.html',
    styleUrl: './usage.component.scss',
    providers: [MessageService]
})
export class UsageComponent extends PaginatedComponent<UsageDto> implements OnInit {
    substances = new Map<number, string>();
    sentiments = new Map<number, string>([
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
    showRecommendationDialog = false;

    tagSeverity:("success" | "secondary" | "info" | "warn" | "danger" | "contrast" | undefined)[] = [
        'success',
        'warn',
        'info',
        'danger',
    ];

    constructor(
        private usageService: UsageService,
        private substanceService: SubstanceService,
        private messageService: MessageService,
        private recommendationService: RecommendationService,
        private route: Router,
        private translateService: TranslocoService
    ) {
        super();
    }
    
    ngOnInit(): void {
        this.substanceService.list().then(results => {
            const substances = results as SubstanceDto[];
            if (!substances.length) {
                this.route.navigate(["/substance-add"]);
                return;
            }
            substances.forEach(substance => this.substances.set(substance.id, substance.name));
        });

        this.usageService.list().then(usages => {
            usages.sort((a, b) => a.datetime < b.datetime ? 1 : -1);

            this.originalUsages = usages as UsageDto[];
            this.groupUsageBySubstance(this.originalUsages);

            this.initializePagination();
            this.generatePaginatedItems();

            this.calculateTimeWithoutUsage(this.originalUsages);

            this.getRecommendations(this.originalUsages);
        });
        
    }

    groupUsageBySubstance(usages: UsageDto[]) {
        const registeredSubstances = new Map();
        // creates an array of usage grouped by substance
        usages.forEach(usage => {
            if (!registeredSubstances.has(usage.substance)) {
                console.log("Substance", this.substances, usage);
                const substanceUsage: SubstanceGroupedItem<UsageDto> = {
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
        const baseDate = new Date('1970-01-01');
        const lastUsage = usages.reduce((prev, curr) => {
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
        
        const duration = DateTime.fromJSDate(new Date).diff(DateTime.fromJSDate(lastUsage.datetime)).rescale();
        this.timeWithoutUsage = duration;
    }

    removeUsage(id: number) {
        this.usageService.remove(id).then(async value => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.translateService.translate('Tudo certo'),
                    detail: this.translateService.translate('Consumo removido com sucesso!'),
                    life: 2000
                });
                setTimeout(() => window.location.reload(), 2000);
            }).catch(async err => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.translateService.translate('Erro'),
                    detail: this.translateService.translate('Não foi possível remover o registro!'),
                    life: 2000
                });
            });
    }

    
    async getRecommendations(result: UsageDto[]) {
        const [trigger, total] = this.usageService.getMostUsedTrigger(result);
        const recommendation = await this.recommendationService.fetchRecommendation(trigger);
        this.recommendationText = recommendation.text.replaceAll("\n", "<br />").replaceAll(new RegExp("\\*\\*(.*?)\\*\\*", 'g'), "<strong>$1</strong>");
        this.showRecommendationDialog = true;
    }
}
