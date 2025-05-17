import { TranslocoService } from "@jsverse/transloco";
import { AchievementDto } from "../dto/achievement.dto";


export class AchievementData {
    public static data: AchievementDto[] = [
        {
            id: 1,
            title: 'First Step',
            description: 'Record your first entry',
            completed: false,
            category: 'engagement',
            icon: '/assets/icons/engagement.svg'
        },
        {
            id: 2,
            title: '1 Week Milestone',
            description: 'Maintain 7 days of sobriety',
            completed: false,
            category: 'sobriety',
            icon: '/assets/icons/sobriety.svg'
        },
        {
            id: 3,
            title: '1 Month Strong',
            description: 'Maintain 30 days of sobriety',
            completed: false,
            category: 'sobriety',
            icon: '/assets/icons/sobriety.svg'
        },
        {
            id: 4,
            title: 'Trigger Awareness',
            description: 'Identify 5 different triggers',
            completed: false,
            category: 'engagement',
            icon: '/assets/icons/engagement.svg'
        },
        {
            id: 5,
            title: '3 Month Journey',
            description: 'Maintain 90 days of sobriety',
            completed: false,
            category: 'sobriety',
            icon: '/assets/icons/sobriety.svg'
        },
        {
            id: 6,
            title: 'Alternative Explorer',
            description: 'Try 3 different alternative activities',
            completed: false,
            category: 'alternatives',
            icon: '/assets/icons/alternatives.svg'
        },
        {
            id: 7,
            title: 'Breathing Master',
            description: 'Complete 5 breathing exercises',
            completed: false,
            category: 'alternatives',
            icon: '/assets/icons/alternatives.svg'
        },
        {
            id: 8,
            title: 'Motivation Collector',
            description: 'Add 3 motivational factors',
            completed: false,
            category: 'motivational',
            icon: '/assets/icons/motivational.svg'
        },
        {
            id: 9,
            title: 'Motivation Driven',
            description: 'Use motivational factors to avoid substance use 3 times',
            completed: false,
            category: 'motivational',
            icon: '/assets/icons/motivational.svg'
        },
        {
            id: 10,
            title: 'Money Saver',
            description: 'Save $100 by avoiding substance use',
            completed: false,
            category: 'financial',
            icon: '/assets/icons/financial.svg'
        },
        {
            id: 11,
            title: 'Consistent Tracker',
            description: 'Record entries for 10 consecutive days',
            completed: false,
            category: 'engagement',
            icon: '/assets/icons/engagement.svg'
        },
        {
            id: 12,
            title: 'Alternative Success',
            description: 'Successfully use alternatives 5 times to avoid substance use',
            completed: false,
            category: 'alternatives',
            icon: '/assets/icons/alternatives.svg'
        },
    ];

    constructor(
        private translateService: TranslocoService,
    ) {
        this.translateService.translate('First Step');
        this.translateService.translate('Record your first entry');

        this.translateService.translate('1 Week Milestone');
        this.translateService.translate('Maintain 7 days of sobriety');

        this.translateService.translate('1 Month Strong');
        this.translateService.translate('Maintain 30 days of sobriety');

        this.translateService.translate('Trigger Awareness');
        this.translateService.translate('Identify 5 different triggers');

        this.translateService.translate('3 Month Journey');
        this.translateService.translate('Maintain 90 days of sobriety');

        this.translateService.translate('Alternative Explorer');
        this.translateService.translate('Try 3 different alternative activities');

        this.translateService.translate('Breathing Master');
        this.translateService.translate('Complete 5 breathing exercises');

        this.translateService.translate('Motivation Collector');
        this.translateService.translate('Add 3 motivational factors');

        this.translateService.translate('Motivation Driven');
        this.translateService.translate('Use motivational factors to avoid substance use 3 times');

        this.translateService.translate('Money Saver');
        this.translateService.translate('Save $100 by avoiding substance use');

        this.translateService.translate('Consistent Tracker');
        this.translateService.translate('Record entries for 10 consecutive days');

        this.translateService.translate('Alternative Success');
        this.translateService.translate('Successfully use alternatives 5 times to avoid substance use');


    }
}
