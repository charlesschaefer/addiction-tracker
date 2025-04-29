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
            description: 'Use motivational factors to avoid substance use 3 times (ver como fazer o registro)',
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
}
