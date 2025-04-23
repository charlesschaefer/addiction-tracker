export interface SubstanceDto {
    id: number;
    name: string;
}

export type SubstanceAddDto = Pick<SubstanceDto, "name">;

export type Substance = SubstanceDto | SubstanceAddDto;
