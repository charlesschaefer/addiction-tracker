import { TriggerAddDto } from "./trigger.dto";

export interface UsageDto {
    id: number;
    substance: number;
    quantity: number;
    datetime: Date;
    sentiment: number;
    craving: number;
    trigger: TriggerAddDto[] | null;
}

export type UsageAddDto = Omit<UsageDto, "id">;