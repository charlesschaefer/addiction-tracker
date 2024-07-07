import { DateTime } from 'luxon';

export interface UsageDto {
    id: number;
    substance: number;
    quantity: number;
    datetime: Date;
    sentiment: number;
    craving: number;
    trigger: string[];
}

export type UsageAddDto = Omit<UsageDto, "id">;