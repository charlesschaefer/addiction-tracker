import { TranslocoService } from "@jsverse/transloco";
import { TriggerDto } from "../dto/trigger.dto";

export class TriggerData {
    public static data: TriggerDto[] = [
        {
            id: 1,
            name: 'Stress',
        },
        {
            id: 2,
            name: 'Social gathering',
        },
        {
            id: 3,
            name: 'Boredom',
        },
        {
            id: 4,
            name: 'Anxiety',
        },
        {
            id: 5,
            name: 'Celebration',
        },
        {
            id: 6,
            name: 'Hungry',
        },
        {
            id: 7,
            name: 'Angry',
        },
        {
            id: 8,
            name: 'Loneliness',
        },
        {
            id: 9,
            name: 'Tired',
        },
        {
            id: 10,
            name: 'Sadness',
        },
        {
            id: 11,
            name: 'Frustration',
        },
        {
            id: 12,
            name: 'Excitement',
        },
        {
            id: 13,
            name: 'Sleepiness',
        },
    ];

    constructor(
        private translateService: TranslocoService,
    ) {
        this.translateService.translate('Stress');
        this.translateService.translate('Social gathering');
        this.translateService.translate('Boredom');
        this.translateService.translate('Anxiety');
        this.translateService.translate('Celebration');
        this.translateService.translate('Hungry');
        this.translateService.translate('Angry');
        this.translateService.translate('Loneliness');
        this.translateService.translate('Tired');
        this.translateService.translate('Sadness');
        this.translateService.translate('Frustration');
        this.translateService.translate('Excitement');
        this.translateService.translate('Sleepiness');
    }
}


