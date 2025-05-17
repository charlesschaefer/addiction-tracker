import { TriggerAddDto, TriggerDto } from "./trigger.dto";

export interface UsageDto {
    id: number;
    substance: number;
    quantity: number;
    datetime: Date;
    sentiment: number;
    craving: number;
    trigger: TriggerAddDto[] | TriggerDto[] | null;
    cost?: number;
}

export type UsageAddDto = Omit<UsageDto, "id">;
