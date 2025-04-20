import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ChartModule } from 'primeng/chart';
import { PaginatorModule } from 'primeng/paginator';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DateTime } from 'luxon';


import { CostService } from '../services/cost.service';
import { CostDto } from '../dto/cost.dto';
import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { ChartDataset, ChartData } from '../util/chart-types';
import { PaginatedComponent, SubstanceGroupedItem } from '../util/paginated-component';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-cost',
    standalone: true,
    imports: [
        TableModule,
        PanelModule,
        CurrencyPipe,
        ChartModule,
        PaginatorModule,
        AccordionModule,
        ToastModule,
        RouterLink,
        TranslateModule
    ],
    templateUrl: './cost.component.html',
    styleUrl: './cost.component.scss',
    providers: [MessageService]
})
export class CostComponent extends PaginatedComponent<CostDto> implements OnInit {
    DateTime = DateTime
    // substance_id and total_cost
    calculatedCosts = new Map<number, number>();
    
    substances = new Map<number, string>();
    chartOptions = {
        animation: true
    };
    chartData: ChartData;



    constructor(
        private costService: CostService,
        private substanceService: SubstanceService,
        private messageService: MessageService,
        private translate: TranslateService,
    ) {
        super();
    }
    
    ngOnInit() {
        this.substanceService.list().then(results => {
            const substances = results as SubstanceDto[];
            substances.map(substance => this.substances.set(substance.id, substance.name));
        });

        this.costService.list().then(costs => {
           this.groupCostBySubstance(costs as CostDto[]); 
           this.calculateTotalCosts();
           this.prepareChartData();

           this.initializePagination();
           this.generatePaginatedItems();
        });
    }

    groupCostBySubstance(costs: CostDto[]) {
        const registeredSubstances = new Map();
        // creates an array of cost grouped by substance
        costs.forEach(cost => {
            if (!registeredSubstances.has(cost.substance)) {
                const substanceCost: SubstanceGroupedItem<CostDto> = {
                    name: this.substances.get(cost.substance) as unknown as string,
                    substanceId: cost.substance,
                    items: [cost]
                };
                this.allItems.push(substanceCost);
                registeredSubstances.set(cost.substance, this.allItems.length - 1);
                return;
            }
            this.allItems[registeredSubstances.get(cost.substance)].items.push(cost);
        });
    }

    calculateTotalCosts() {
        this.allItems.map(substanceCost => {
            const totalCost = substanceCost
                .items
                .reduce(
                    (prev, curr) => {
                        const total = prev.value + curr.value;
                        return {
                            date: new Date(),
                            id: 0,
                            substance: curr.substance,
                            value: total
                        }
                    }, {
                        date: new Date(),
                        id: 0,
                        substance: 0,
                        value: 0
                    });
            this.calculatedCosts.set(substanceCost.substanceId, totalCost.value);
        });
    }

    prepareChartData() {
        const labels: string[] = [];
        const datasets: ChartDataset = {
            data: []
        };
        let key;
        const keys = this.calculatedCosts.keys();
        while (!(key = keys.next()).done) {
            labels.push(this.substances.get(key.value) as unknown as string);
            datasets.data.push(this.calculatedCosts.get(key.value) as unknown as number);
        }
        this.chartData = {datasets: [datasets], labels};
        console.dir(this.chartData);
    }

    removeCost(id: number) {
        this.costService.remove(id).then(async values => {
                this.messageService.add({
                    severity: "success",
                    summary: await firstValueFrom(this.translate.get("Tudo certo")),
                    detail: await firstValueFrom(this.translate.get("Gasto removido com sucesso!")),
                    life: 2000
                });
                setTimeout(() => window.location.reload(), 2000);
            }).catch(async err => {
                this.messageService.add({
                    severity: "error",
                    summary: await firstValueFrom(this.translate.get("Erro")),
                    detail: await firstValueFrom(this.translate.get("Não foi possível remover o gasto")),
                    life: 2000
                });
            });
    }
}
