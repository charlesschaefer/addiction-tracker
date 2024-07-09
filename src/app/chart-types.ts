export interface ChartDataset {
    data: number[];
    label?: string;
    fill?: boolean;
    borderDash?: [number, number];
    backgroundColor?: string;
    borderColor?: string;
    tension?: number;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface UsageChart {
    substanceId: number;
    chart: ChartData;
}