import { DateTime } from 'luxon';

export interface UsageDto {
    id: number;
    substance: number;
    quantity: number;
    datetime: DateTime;
    sentiment: number;
}

export type UsageAddDto = Omit<UsageDto, "id">;