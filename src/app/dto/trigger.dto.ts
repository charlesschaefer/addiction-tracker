
export interface TriggerDto {
    id: number;
    name: string;
    archived?: number;
    archive_date?: Date | null;
}

export type TriggerAddDto = Pick<TriggerDto, 'name'>;
