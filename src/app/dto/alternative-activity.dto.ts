
export interface AlternativeActivityDto {
    id: number;
    name: string;
    description: string;
    time: string;
    count: number;
    successCount: number;
    failCount: number;
}

export type AlternativeActivityAddDto = Omit<AlternativeActivityDto, "id">;
