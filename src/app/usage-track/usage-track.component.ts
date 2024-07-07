import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ChartModule } from 'primeng/chart';
import { UsageService } from '../services/usage.service';
import { UsageDto } from '../dto/usage.dto';

interface ChartDataset {
    label: string;
    data: number[];
}

interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

@Component({
    selector: 'app-usage-track',
    standalone: true,
    imports: [ChartModule, MatCardModule],
    templateUrl: './usage-track.component.html',
    styleUrl: './usage-track.component.scss'
})
export class UsageTrackComponent implements OnInit {
    data: ChartData;
    options = {
        animation: true
    };

    constructor(
        private usageService: UsageService<UsageDto>,
    ) {}

    ngOnInit() {
        this.usageService.list().subscribe(result => {
            let data: ChartData = {
                labels: result.map(usage => usage.datetime.toLocaleDateString()),
                datasets: [
                    {
                        label: 'Consumo',
                        data: result.map(usage => usage.quantity)
                    },
                    {
                        label: 'Sentimento',
                        data: result.map(usage => usage.sentiment)
                    }
                ]
            };

            console.log("final Data: ", data);

            this.data = data;
        })
    }
}
