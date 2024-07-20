import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChartModule, UIChart } from 'primeng/chart';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { SplitterModule } from 'primeng/splitter';
import { AccordionModule } from 'primeng/accordion';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DateTime } from 'luxon';
import { JoyrideModule } from 'ngx-joyride';

import { UsageService } from '../services/usage.service';
import { UsageDto } from '../dto/usage.dto';
import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { ChartData, ChartDataset, UsageChart} from '../util/chart-types';
import { RecommendationService } from '../services/recommendation.service';
import { RecommendationDto } from '../dto/recommendation.dto';
import { RecommendationComponent } from '../recommendation/recommendation.component';


interface TriggerUsage {
    trigger: string;
    usage: number;
}

type SubstanceTriggerUsage = Map<number, TriggerUsage[]>;

@Component({
    selector: 'app-usage-track',
    standalone: true,
    imports: [
        ChartModule,
        PanelModule,
        CardModule,
        DividerModule,
        SplitterModule,
        AccordionModule,
        ToggleButtonModule,
        FormsModule,
        DialogModule,
        ButtonModule,
        RecommendationComponent,
        RouterLink,
        JoyrideModule,
    ],
    templateUrl: './usage-track.component.html',
    styleUrl: './usage-track.component.scss'
})
export class UsageTrackComponent implements OnInit {
    usageChartData: UsageChart[];
    triggerChartData: Map<number, ChartData> = new Map;
    substances: Map<number, SubstanceDto> = new Map();

    groupByHour: boolean = false;

    originalUsages: UsageDto[];

    recommendationText: string;
    showRecommendationDialog: boolean = false;


    options = {
        animation: true
    };

    constructor(
        private usageService: UsageService<UsageDto>,
        private substanceService: SubstanceService<SubstanceDto>,
        private recommendationService: RecommendationService<RecommendationDto>,
        private route: Router,
    ) {}

    ngOnInit() {
        this.substanceService.list().subscribe(result => {
            if (!result.length) {
                this.route.navigate(['/substance-add']);
                return;
            }
            result.map(substance => {
                this.substances.set(substance.id, substance);
            });
        });

        this.usageService.list().subscribe(result => {
            this.originalUsages = result;

            this.prepareChartData(result);
            this.prepareTriggerChart(result);

            this.getRecommendations(result);
        });

        window.addEventListener('resize', (event) => this.reRenderOnResize(event));
    }

    prepareChartData(result: UsageDto[]) {
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
    }

    prepareTriggerChart(result: UsageDto[]) {
        let triggerData = this.consolidateTriggerData(result);

        triggerData.forEach((triggerUsage, substanceId) => {
            let chartData: ChartData = {
                labels: triggerUsage.map(usage => usage.trigger),
                datasets: [
                    {
                        label: 'Consumo total',
                        data: triggerUsage.map(usage => usage.usage),
                        backgroundColor: 'rgba(156, 39, 176, 0.4)'
                    }
                ]
            };
            this.triggerChartData.set(substanceId, chartData);
        });
    }

    // triggerMap = Map<substanceId, Map<trigger_name, count>>
    // triggerChatData = Map<substanceId, ChartData>
    consolidateTriggerData(data: UsageDto[]): SubstanceTriggerUsage {
        let substanceTriggerMap: Map<number, Map<string, number>> = new Map();
         data.forEach(currentValue => {
            if (!substanceTriggerMap.has(currentValue.substance)) {
                substanceTriggerMap.set(currentValue.substance, new Map());
            }
            let triggerMap = substanceTriggerMap.get(currentValue.substance);
            // loops all the usage's triggers to count them
            currentValue.trigger?.forEach(trigger => {
                if (!triggerMap?.has(trigger.name)) {
                    triggerMap?.set(trigger.name, 0);
                }
                triggerMap
                    ?.set(
                        trigger.name, 
                        triggerMap
                            ?.get(trigger.name) as unknown as number
                            + currentValue.quantity
                    );
            });
            substanceTriggerMap.set(currentValue.substance, triggerMap as Map<string, number>);
        });

        let triggerChartData: SubstanceTriggerUsage = new Map;
        substanceTriggerMap.forEach((triggerData, substanceId) => {
            let triggerUsage: TriggerUsage[] = [];
            triggerData.forEach((triggerCount, triggerName) => {
                triggerUsage.push({
                    trigger: triggerName,
                    usage: triggerCount
                });
            });
            triggerChartData.set(substanceId, triggerUsage);
        });

        return triggerChartData;
    }

    groupBy(by: "hour" | "day") {
        this.usageService.list().subscribe((result: UsageDto[]) => {
            if (this.groupByHour) {
            
                let data; 
                if (by == 'hour') {
                    data = this.usageService.groupByHour(result);
                } else {
                    data = this.usageService.groupByDay(result);
                }

                this.prepareChartData(this.usageService.groupMapToUsageDto(data));
            } else {
                this.prepareChartData(result);
            }

            this.prepareTriggerChart(result);
        });
    }

    reRenderOnResize(event: UIEvent) {
        // forces a re-render
        if (this.usageChartData.length) {
            let usageChart = this.usageChartData;
            this.usageChartData = [];
            setTimeout(() => this.usageChartData = usageChart, 100);
        }
        //this.usageChartData[0].chart.datasets.push(item as ChartDataset);
    }

    async getRecommendations(result: UsageDto[]) {
        let [trigger, total] = this.usageService.getMostUsedTrigger(result);
        const recommendation = await this.recommendationService.fetchRecommendation(trigger);
        this.recommendationText = recommendation.text.replaceAll("\n", "<br />").replaceAll(new RegExp("\\*\\*(.*?)\\*\\*", 'g'), "<strong>$1</strong>");
        this.showRecommendationDialog = true;
    }

}
