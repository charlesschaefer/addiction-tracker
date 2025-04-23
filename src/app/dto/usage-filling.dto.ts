/**
 * @fileoverview DTO for recording statistics about the Usage Filling process.
 * Everytime the user opens the Usage Filling screen, a new entry is created in the database with 
 * information like the substance it was about to use, the motivational factor that was shown,
 * the alternative activity that the user selected (if some was) and if the user kept the usage or not.
 */
export interface UsageFillingDto {
    id: number; // Primary key, auto-increment
    datetime: Date;
    substance: number; // Foreign key to substance
    motivational_factor?: number; // Foreign key to motivational_factor, nullable
    alternative_activity?: number; // Foreign key to alternative_activity, nullable
    kept_usage: boolean;
}

export type UsageFillingAddDto = Omit<UsageFillingDto, "id">;
