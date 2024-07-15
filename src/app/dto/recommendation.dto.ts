import { TriggerAddDto } from "./trigger.dto";

export interface RecommendationDto {
    id: number;
    trigger: number;
    text: string;
}

export type RecommendationAddDto = Omit<RecommendationDto, "id">;