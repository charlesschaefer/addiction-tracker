import { Component, OnInit } from '@angular/core';
import { ChartModule, UIChart } from 'primeng/chart';
import { PanelModule } from 'primeng/panel';

import { UsageService } from '../services/usage.service';
import { UsageDto } from '../dto/usage.dto';

interface ChartDataset {
    label: string;
    data: number[];
    fill?: boolean;
    borderDash?: [number, number];
    backgroundColor?: string;
    borderColor?: string;
    tension?: number;
}

interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

interface TriggerUsage {
    trigger: string;
    usage: number;
}

@Component({
    selector: 'app-usage-track',
    standalone: true,
    imports: [ChartModule, PanelModule],
    templateUrl: './usage-track.component.html',
    styleUrl: './usage-track.component.scss'
})
export class UsageTrackComponent implements OnInit {
    usageChartData: ChartData;
    triggerChartData: ChartData;

    options = {
        animation: true
    };

    constructor(
        private usageService: UsageService<UsageDto>,
    ) {}

    ngOnInit() {
        this.usageService.list().subscribe(result => {
            const documentStyle = getComputedStyle(document.documentElement);
            let usageChartData: ChartData = {
                labels: result.map(usage => usage.datetime.toLocaleDateString()),
                datasets: [
                    {
                        label: 'Consumo',
                        data: result.map(usage => usage.quantity),
                        tension: 0.3,
                        borderColor: documentStyle.getPropertyValue('--blue-500')
                    },
                    {
                        label: 'Sentimento',
                        data: result.map(usage => usage.sentiment),
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(156, 39, 176, 0.4)'
                    },
                    {
                        label: 'Fissura',
                        data: result.map(usage => usage.craving),
                        tension: 0.3,
                        borderDash: [5, 5],
                        borderColor: documentStyle.getPropertyValue('--orange-500')
                    }
                ]
            };
            this.usageChartData = usageChartData;
            
            let triggerData = this.consolidateTriggerData(result);
            let triggerChartData: ChartData = {
                labels: triggerData.map(triggerUsage => triggerUsage.trigger),
                datasets: [
                    {
                        label: 'Consumo',
                        data: triggerData.map(triggerUsage => triggerUsage.usage),
                        backgroundColor: 'rgba(156, 39, 176, 0.4)'
                    }
                ]
            }

            this.triggerChartData = triggerChartData;
        });
    }

    consolidateTriggerData(data: UsageDto[]): TriggerUsage[] {
        let triggerMap = new Map();
         data.forEach((currentValue, currIdx, data) => {
            // loops all the usage's triggers to count them
            currentValue.trigger?.map(trigger => {
                if (!triggerMap.has(trigger.name)) {
                    triggerMap.set(trigger.name, 0);
                }
                triggerMap.set(trigger.name, triggerMap.get(trigger.name) + currentValue.quantity);
            });
        });

        let key;
        let keys = triggerMap.keys();
        let triggerUsage: TriggerUsage[] = [];

        while (!(key = keys.next()).done) {
            triggerUsage.push({
                trigger: key.value,
                usage: triggerMap.get(key.value)
            });
        }
        return triggerUsage;
    }

}
