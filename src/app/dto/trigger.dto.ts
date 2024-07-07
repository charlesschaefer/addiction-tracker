
export interface TriggerDto {
    id: number;
    name: string;
}

export type TriggerAddDto = Pick<TriggerDto, 'name'>;