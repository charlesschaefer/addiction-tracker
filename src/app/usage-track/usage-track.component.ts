import { Component, OnInit } from '@angular/core';
import { ChartModule, UIChart } from 'primeng/chart';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { SplitterModule } from 'primeng/splitter';
import { AccordionModule } from 'primeng/accordion';

import { UsageService } from '../services/usage.service';
import { UsageDto } from '../dto/usage.dto';
import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { ChartData, ChartDataset, UsageChart} from '../util/chart-types';
import { DateTime } from 'luxon';


interface TriggerUsage {
    trigger: string;
    usage: number;
}

type SubstanceTriggerUsage = Map<number, TriggerUsage[]>;

@Component({
    selector: 'app-usage-track',
    standalone: true,
    imports: [ChartModule, PanelModule, CardModule, DividerModule, SplitterModule, AccordionModule],
    templateUrl: './usage-track.component.html',
    styleUrl: './usage-track.component.scss'
})
export class UsageTrackComponent implements OnInit {
    usageChartData: UsageChart[];
    triggerChartData: Map<number, ChartData>;
    substances: Map<number, SubstanceDto> = new Map();


    options = {
        animation: true
    };

    constructor(
        private usageService: UsageService<UsageDto>,
        private substanceService: SubstanceService<SubstanceDto>,
    ) {}

    ngOnInit() {
        this.usageService.list().subscribe(result => {
            const documentStyle = getComputedStyle(document.documentElement);
            let usageChartData: UsageChart[] = [];
            let registeredSubstances = new Map;
            result.forEach(usage => {
                if (!registeredSubstances.has(usage.substance)) {
                    usageChartData.push({
                        substanceId: usage.substance,
                        chart: {
                            labels: [],
                            datasets: [
                                {
                                    label: 'Consumo',
                                    data: [],
                                    tension: 0.3,
                                    borderColor: documentStyle.getPropertyValue('--blue-500')
                                },
                                {
                                    label: 'Sentimento',
                                    data: [],
                                    tension: 0.3,
                                    fill: true,
                                    backgroundColor: 'rgba(156, 39, 176, 0.4)'
                                },
                                {
                                    label: 'Fissura',
                                    data: [],
                                    tension: 0.3,
                                    borderDash: [5, 5],
                                    borderColor: documentStyle.getPropertyValue('--orange-500')
                                }
                            ]
                        }
                    });
                    // register the index where the substance was added.
                    registeredSubstances.set(usage.substance, usageChartData.length - 1);
                }
                let usageIdx = registeredSubstances.get(usage.substance);
                let usageChart = usageChartData[usageIdx].chart;
                usageChart.labels.push(DateTime.fromJSDate(usage.datetime).toFormat('dd/MM HH:mm'));
                usageChart.datasets[0].data.push(usage.quantity);
                usageChart.datasets[1].data.push(usage.sentiment);
                usageChart.datasets[2].data.push(usage.craving);
            });

            this.usageChartData = usageChartData;
            
            let triggerData = this.consolidateTriggerData(result);
            let triggerChartData: ChartData = {
                labels: triggerData.map(triggerUsage => triggerUsage.trigger),
                datasets: [
                    {
                        label: 'Consumo total',
                        data: triggerData.map(triggerUsage => triggerUsage.usage),
                        backgroundColor: 'rgba(156, 39, 176, 0.4)'
                    }
                ]
            }

            this.triggerChartData = triggerChartData;
        });

        this.substanceService.list().subscribe(result => {
            result.map(substance => {
                this.substances.set(substance.id, substance);
            });
        })
    }

    // @TODO: finish to mount the map separated by substance, instead of 
    // counting every trigger of every usage of every substance at the same time
    // triggerMap = Map<substanceId, Map<trigger_name, count>>
    consolidateTriggerData(data: UsageDto[]): TriggerUsage[] {
        let triggerMap: Map<number, Map<string, number>> = new Map();
         data.forEach(currentValue => {
            if (!triggerMap.has(currentValue.substance)) {
                triggerMap.set(currentValue.substance, new Map());
            }
            // loops all the usage's triggers to count them
            currentValue.trigger?.forEach(trigger => {
                if (!triggerMap.get(currentValue.substance)?.has(trigger.name)) {
                    triggerMap.get(currentValue.substance)?.set(trigger.name, 0);
                }
                triggerMap
                    .get(currentValue.substance)
                    ?.set(
                        trigger.name, 
                        triggerMap
                            .get(currentValue.substance)
                            ?.get(trigger.name) as unknown as number
                            + currentValue.quantity
                    );
            });
        });

        let key;
        let keys = triggerMap.keys();
        let triggerUsage: TriggerUsage[] = [];

        for (let [key, map] of triggerMap) {
        //while (!(key = keys.next()).done) {
            triggerUsage.push({
                trigger: key,
                usage: triggerMap.get(key.value)
            });
        }
        return triggerUsage;
    }

}
