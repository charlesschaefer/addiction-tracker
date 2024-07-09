import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { ChartModule } from 'primeng/chart';
import { PaginatorModule } from 'primeng/paginator';
import { DateTime } from 'luxon';


import { CostService } from '../services/cost.service';
import { CostDto } from '../dto/cost.dto';
import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { ChartDataset, ChartData } from '../util/chart-types';
import { PaginatedComponent, SubstanceGroupedItem } from '../util/paginated-component';

@Component({
    selector: 'app-cost',
    standalone: true,
    imports: [
        TableModule,
        PanelModule,
        CurrencyPipe,
        ChartModule,
        PaginatorModule
    ],
    templateUrl: './cost.component.html',
    styleUrl: './cost.component.scss'
})
export class CostComponent extends PaginatedComponent<CostDto> implements OnInit {
    DateTime = DateTime
    // substance_id and total_cost
    calculatedCosts: Map<number, number> = new Map();
    
    substances: Map<number, string> = new Map;
    chartOptions = {
        animation: true
    };
    chartData: ChartData;



    constructor(
        private costService: CostService<CostDto>,
        private substanceService: SubstanceService<SubstanceDto>,
    ) {
        super();
    }
    
    ngOnInit() {
        this.substanceService.list().subscribe(substances => {
            substances.map(substance => this.substances.set(substance.id, substance.name));
        });

        this.costService.list().subscribe(costs => {
           this.groupCostBySubstance(costs); 
           this.calculateTotalCosts();
           this.prepareChartData();

           this.initializePagination();
           this.generatePaginatedItems();
        });
    }

    groupCostBySubstance(costs: CostDto[]) {
        let registeredSubstances = new Map();
        // creates an array of cost grouped by substance
        costs.forEach(cost => {
            if (!registeredSubstances.has(cost.substance)) {
                let substanceCost: SubstanceGroupedItem<CostDto> = {
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
            let totalCost = substanceCost
                .items
                .reduce(
                    (prev, curr) => {
                        let total = prev.value + curr.value;
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
        let labels: string[] = [];
        let datasets: ChartDataset = {
            data: []
        };
        let key;
        let keys = this.calculatedCosts.keys();
        while (!(key = keys.next()).done) {
            labels.push(this.substances.get(key.value) as unknown as string);
            datasets.data.push(this.calculatedCosts.get(key.value) as unknown as number);
        }
        this.chartData = {datasets: [datasets], labels};
        console.dir(this.chartData);
    }
}
