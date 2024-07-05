export interface SubstanceDto {
    id: number;
    name: string;
}

export type SubstanceAddDto = Pick<SubstanceDto, "name">;