
export interface CostDto {
    id: number;
    substance: number;
    value: number;
    date: Date;
}

export type CostAddDto = Omit<CostDto, 'id'>;
