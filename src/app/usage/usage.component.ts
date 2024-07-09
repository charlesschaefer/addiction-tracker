import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Tag, TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';
import { PaginatorModule } from 'primeng/paginator';
import { Card, CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { DateTime, Duration } from 'luxon';

import { UsageService } from '../services/usage.service';
import { UsageDto } from '../dto/usage.dto';
import { TriggerService } from '../services/trigger.service';
import { TriggerDto } from '../dto/trigger.dto';
import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { PaginatedComponent, SubstanceGroupedItem } from '../util/paginated-component';


interface SubstanceUsage {
    name: string;
    usages: UsageDto[];
}

@Component({
    selector: 'app-usage',
    standalone: true,
    imports: [TableModule, TagModule, PanelModule, PaginatorModule, CardModule, AccordionModule],
    templateUrl: './usage.component.html',
    styleUrl: './usage.component.scss'
})
export class UsageComponent extends PaginatedComponent<UsageDto> implements OnInit {
    substances: Map<number, string> = new Map;
    sentiments: Map<number, string> = new Map([
        [1, ':('],
        [2, ':/'],
        [3, ':|'],
        [4, ':)'],
        [5, ':D'],
    ]);
    DateTime = DateTime;
    timeWithoutUsage: Duration;

    tagSeverity:("success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined)[] = [
        'success',
        'warning',
        'info',
        'danger',
    ];

    constructor(
        private usageService: UsageService<UsageDto>,
        private substanceService: SubstanceService<SubstanceDto>,
    ) {
        super();
    }
    
    ngOnInit(): void {
        this.substanceService.list().subscribe(substances => {
            substances.map(substance => this.substances.set(substance.id, substance.name));
        });

        this.usageService.list().subscribe(usages => {
            this.groupUsageBySubstance(usages);

            this.initializePagination();
            this.generatePaginatedItems();

            this.calculateTimeWithoutUsage(usages);
        });
        
    }

    groupUsageBySubstance(usages: UsageDto[]) {
        let registeredSubstances = new Map();
        // creates an array of usage grouped by substance
        usages.map(usage => {
            if (!registeredSubstances.has(usage.substance)) {
                let substanceUsage: SubstanceGroupedItem<UsageDto> = {
                    name: this.substances.get(usage.substance) as unknown as string,
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
        let lastUsage = usages.reduce((prev, curr) => {
            if (curr.datetime > prev.datetime) {
                return curr;
            }
            return prev;
        }, {
            datetime: new Date('1970-01-01'),
            craving: 0,
            id: 0,
            quantity: 0,
            sentiment: 0,
            substance: 0,
            trigger: []
        });
        
        let duration = DateTime.fromJSDate(new Date).diff(DateTime.fromJSDate(lastUsage.datetime)).rescale();
        console.log(duration);
        this.timeWithoutUsage = duration;
    }
   
}
