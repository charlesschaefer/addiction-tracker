import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DateTime } from 'luxon';


import { UsageService } from '../services/usage.service';
import { UsageDto } from '../dto/usage.dto';
import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { UsageChart } from '../util/chart-types';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

interface UsageInterval {
    datetime: Date;
    interval: number;
}

@Component({
    selector: 'app-usage-interval',
    standalone: true,
    imports: [AccordionModule, CardModule, ChartModule, RouterLink, TranslateModule],
    templateUrl: './usage-interval.component.html',
    styleUrl: './usage-interval.component.scss'
})
export class UsageIntervalComponent implements OnInit {
    substances = new Map<number, string>();

    usageIntervals: Map<number, UsageInterval[]>;
    usageChartData: UsageChart[];

    options = {
        animation: true
    };

    constructor(
        private usageService: UsageService<UsageDto>,
        private substanceService: SubstanceService<SubstanceDto>,
        private route: Router,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        this.substanceService.list().subscribe(results => {
            if (!results.length) {
                this.route.navigate(['/substance-add']);
                return;
            }
            const substanceMap = new Map();
            results.forEach(substance => {
                if (!substanceMap.has(substance.id)) {
                    substanceMap.set(substance.id, substance.name);
                }
            })
            this.substances = substanceMap;
        });

        this.usageService.list().subscribe(results => {
            this.calculateIntervalBySubstance(results);
            this.prepareChartData();
        });

        window.addEventListener('resize', (event) => this.reRenderOnResize(event));
    }

    calculateIntervalBySubstance(usages: UsageDto[]) {
        const registeredSubstances = new Map();
        // creates an array of usage grouped by substance
        usages.forEach(usage => {
            if (!registeredSubstances.has(usage.substance)) {
                registeredSubstances.set(usage.substance, [usage]);
                return;
            }
            const registeredUsages = registeredSubstances.get(usage.substance);
            registeredUsages.push(usage);
            registeredSubstances.set(usage.substance, registeredUsages);
        });

        // sorts entris by datetime
        registeredSubstances.forEach((usages, substanceId) => {
            usages.sort((a: UsageDto, b: UsageDto) => {
                if (a.datetime > b.datetime) return 1;
                return -1;
            });
            registeredSubstances.set(substanceId, usages);
        });

        const registeredIntervals = new Map<number, UsageInterval[]>();
        // calculates interval (in minutes) between each usage
        registeredSubstances.forEach((usages, substanceId) => {
            if (!registeredIntervals.has(substanceId)) {
                registeredIntervals.set(substanceId, []);
            }
            let first = true;
            let lastUsage: UsageDto;
            usages.forEach((usage: UsageDto) => {
                if (first) {
                    lastUsage = usage;
                    first = false;
                    // steps out the first item
                    return;
                }
                const interval: UsageInterval = {
                    datetime: usage.datetime,
                    interval: DateTime.fromJSDate(usage.datetime).diff(DateTime.fromJSDate(lastUsage.datetime)).as('minutes')
                };

                const intervals = registeredIntervals.get(substanceId);
                intervals?.push(interval);
                registeredIntervals.set(substanceId, intervals as UsageInterval[]);

                lastUsage = usage;
            });
        });

        this.usageIntervals = registeredIntervals;
    }

    prepareChartData() {
        const documentStyle = getComputedStyle(document.documentElement);
        const usageChartData: UsageChart[] = [];
        const registeredSubstances = new Map;
        this.usageIntervals.forEach(async (usageIntervals, substanceId) => {
            if (!registeredSubstances.has(substanceId)) {
                usageChartData.push({
                    substanceId: substanceId,
                    chart: {
                        labels: [],
                        datasets: [
                            {
                                label: await firstValueFrom(this.translate.get('Intervalo de Consumo (minutos)')),
                                data: [],
                                tension: 0.3,
                                borderColor: documentStyle.getPropertyValue('--blue-500')
                            },
                        ]
                    }
                });
                // register the index where the substance was added.
                registeredSubstances.set(substanceId, usageChartData.length - 1);
            }
            const usageIdx = registeredSubstances.get(substanceId);
            const usageChart = usageChartData[usageIdx].chart;
            usageIntervals.forEach(usageInterval => {
                usageChart.labels.push(DateTime.fromJSDate(usageInterval.datetime).toFormat('dd/MM HH:mm'));
                usageChart.datasets[0].data.push(usageInterval.interval);

            })
        });

        this.usageChartData = usageChartData;
    }

    reRenderOnResize(event: UIEvent) {
        console.log("Resizando", event);
        // forces a re-render
        if (this.usageChartData.length) {
            const usageChart = this.usageChartData;
            this.usageChartData = [];
            setTimeout(() => this.usageChartData = usageChart, 100);
        }
        //this.usageChartData[0].chart.datasets.push(item as ChartDataset);
    }
}
