
export interface AlternativeActivityDto {
    id: number;
    name: string;
    description: string;
    duration: number; // in minutes
}

export type AlternativeActivityAddDto = Omit<AlternativeActivityDto, "id">;
