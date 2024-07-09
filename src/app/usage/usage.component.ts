import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Tag, TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';
import { DateTime } from 'luxon';

import { UsageService } from '../services/usage.service';
import { UsageDto } from '../dto/usage.dto';
import { TriggerService } from '../services/trigger.service';
import { TriggerDto } from '../dto/trigger.dto';
import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';

interface SubstanceUsage {
    name: string;
    usages: UsageDto[];
}

@Component({
    selector: 'app-usage',
    standalone: true,
    imports: [TableModule, TagModule, PanelModule],
    templateUrl: './usage.component.html',
    styleUrl: './usage.component.scss'
})
export class UsageComponent implements OnInit {
    usages: SubstanceUsage[] = [];
    substances: Map<number, string> = new Map;
    sentiments: Map<number, string> = new Map([
        [1, ':('],
        [2, ':/'],
        [3, ':|'],
        [4, ':)'],
        [5, ':D'],
    ]);
    DateTime = DateTime;

    tagSeverity:("success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined)[] = [
        'success',
        'warning',
        'info',
        'danger',
    ]

    constructor(
        private usageService: UsageService<UsageDto>,
        private substanceService: SubstanceService<SubstanceDto>,
    ) {}
    
    ngOnInit(): void {
        this.substanceService.list().subscribe(substances => {
            substances.map(substance => this.substances.set(substance.id, substance.name));
        });

        this.usageService.list().subscribe(usages => {
            let registeredSubstances = new Map();
            // creates an array of usage grouped by substance
            usages.map(usage => {
                if (!registeredSubstances.has(usage.substance)) {
                    let substanceUsage: SubstanceUsage = {
                        name: this.substances.get(usage.substance) as unknown as string,
                        usages: [usage]
                    };
                    this.usages.push(substanceUsage);
                    registeredSubstances.set(usage.substance, this.usages.length - 1);
                    return;
                }
                this.usages[registeredSubstances.get(usage.substance)].usages.push(usage);
            });
        });
        
    }
}
