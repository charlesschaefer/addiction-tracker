
export interface UsageFillingDto {
    id: number; // Primary key, auto-increment
    datetime: Date;
    substance: number; // Foreign key to substance
    motivational_factor?: number; // Foreign key to motivational_factor, nullable
    alternative_activity?: number; // Foreign key to alternative_activity, nullable
    kept_usage: boolean;
}

export type UsageFillingAddDto = Omit<UsageFillingDto, "id">;
