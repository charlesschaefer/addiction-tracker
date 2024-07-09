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
import { ChartDataset, ChartData } from '../chart-types';

interface SubstanceCost {
    name: string;
    substanceId: number;
    costs: CostDto[];
}

interface PageEvent {
    first?: number;
    rows?: number;
    page?: number;
    pageCount?: number;
}

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
export class CostComponent implements OnInit {
    DateTime = DateTime
    allCosts: SubstanceCost[] = [];
    paginatedCosts: SubstanceCost[] = [];
    // substance_id and total_cost
    calculatedCosts: Map<number, number> = new Map();
    
    substances: Map<number, string> = new Map;
    chartOptions = {
        animation: true
    };
    chartData: ChartData;

    /* pagination */
    firstItem: number[] = [];
    rowsToShow: number[] = [];
    totalRecords: number[] = [];


    constructor(
        private costService: CostService<CostDto>,
        private substanceService: SubstanceService<SubstanceDto>,
    ) {}
    
    ngOnInit() {
        this.substanceService.list().subscribe(substances => {
            substances.map(substance => this.substances.set(substance.id, substance.name));
        });

        this.costService.list().subscribe(costs => {
           this.groupCostBySubstance(costs); 
           this.calculateTotalCosts();
           this.prepareChartData();

           this.initializePagination();
           this.generatePaginatedCosts();
        });
    }

    groupCostBySubstance(costs: CostDto[]) {
        let registeredSubstances = new Map();
        // creates an array of cost grouped by substance
        costs.forEach(cost => {
            if (!registeredSubstances.has(cost.substance)) {
                let substanceCost: SubstanceCost = {
                    name: this.substances.get(cost.substance) as unknown as string,
                    substanceId: cost.substance,
                    costs: [cost]
                };
                this.allCosts.push(substanceCost);
                registeredSubstances.set(cost.substance, this.allCosts.length - 1);
                return;
            }
            this.allCosts[registeredSubstances.get(cost.substance)].costs.push(cost);
        });
    }

    calculateTotalCosts() {
        this.allCosts.map(substanceCost => {
            let totalCost = substanceCost
                .costs
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

    initializePagination() {
        this.allCosts.forEach(costs => {
            this.firstItem[costs.substanceId] = 0;
            this.rowsToShow[costs.substanceId] = 10;
            this.totalRecords[costs.substanceId] = costs.costs.length;
        })
    }

    changePage(event: PageEvent, substanceId: number) {
        this.firstItem[substanceId] = event.first as unknown as number;
        this.rowsToShow[substanceId] = event.rows as unknown as number;
        console.log("Event", event);

        this.generatePaginatedCosts();
    }

    generatePaginatedCosts() {
        let paginatedCosts: SubstanceCost[] = [];
        
        this.allCosts.forEach((substanceCost, idx) => {
            let firstItem = this.firstItem[substanceCost.substanceId] as unknown as number;
            let rowsToShow = this.rowsToShow[substanceCost.substanceId] as unknown as number;
            paginatedCosts[idx] = {
                name: substanceCost.name,
                substanceId: substanceCost.substanceId,
                costs: substanceCost.costs.slice(
                    firstItem,
                    firstItem + rowsToShow
                )
            };
            this.totalRecords[substanceCost.substanceId] = substanceCost.costs.length;
        });
        this.paginatedCosts = paginatedCosts;
    }
}