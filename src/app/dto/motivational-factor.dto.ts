
export interface MotivationalFactorDto {
    id: number;
    substance: number;
    type: 'text' | 'image' | 'audio';
    content: string;
    createdAt: Date;
}

export type MotivationalFactorAddDto = Omit<MotivationalFactorDto, "id">;
