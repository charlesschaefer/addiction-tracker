import { Injectable, InputSignal, resource, WritableSignal } from '@angular/core';
import { AchievementAddDto, AchievementDto, SafeIconAchievement } from '../dto/achievement.dto';
import { ServiceAbstract } from './service.abstract';
import { DbService } from './db.service';
import { UsageService } from './usage.service';
import { UsageDto } from '../dto/usage.dto';
import { TriggerService } from './trigger.service';
import { TriggerDto } from '../dto/trigger.dto';
import { MotivationalFactorService } from './motivational-factor.service';
import { MotivationalFactorDto } from '../dto/motivational-factor.dto';
import { AlternativeActivityService } from './alternative-activity.service';
import { UsageFillingDto } from '../dto/usage-filling.dto';
import { TableKeys } from '../app.db';
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { DomSanitizer } from '@angular/platform-browser';
import { TranslocoService } from '@jsverse/transloco';

type Achievements = AchievementDto | AchievementAddDto;

/**
 * Service responsible for managing user achievements.
 * Handles detecting, tracking, and updating achievement progress based on user activities.
 */
@Injectable({
    providedIn: "root",
})
export class AchievementService extends ServiceAbstract<Achievements> {
    protected override storeName: 'achievement' = 'achievement';

    /**
     * Injects dependencies for achievement logic.
     */
    constructor(
        protected override dbService: DbService,
        private usageService: UsageService,
        private triggerService: TriggerService,
        private motivationalFactorService: MotivationalFactorService,
        private alternativeActivityService: AlternativeActivityService,
        private sanitizer: DomSanitizer,
        private translate: TranslocoService,
    ) {
        super();
        this.setTable();
    }

    /**
     * Detects and processes all user achievements.
     * Checks each achievement criteria against the user's data and updates completion status accordingly.
     * 
     * @returns Promise<AchievementDto[]> The list of all achievements with updated completion status
     */
    async detectAchievements() {
        const achievements = await this.list() as AchievementDto[];
        const usages = await this.usageService.list() as UsageDto[];
        
        // Sort usages by datetime in ascending order
        usages.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
        
        // Check each achievement
        await this.checkFirstEntry(achievements, usages);
        await this.checkSobrietyAchievements(achievements, usages);
        await this.checkTriggerAwareness(achievements, usages);
        await this.checkAlternativeActivities(achievements);
        await this.checkBreathingExercises(achievements);
        await this.checkMotivationalFactors(achievements);
        await this.checkMoneySaved(achievements, usages);
        await this.checkConsistentTracker(achievements, usages);
        await this.checkAlternativeSuccess(achievements);
        
        return achievements;
    }
    
    /**
     * Updates an achievement's completion status in the database if changed.
     * 
     * @param achievementId The ID of the achievement to update
     * @param completed The new completion status
     */
    private async updateAchievement(achievementId: number, completed: boolean) {
        const achievement = await this.get(achievementId) as AchievementDto;
        if (achievement && achievement.completed !== completed) {
            achievement.completed = completed;
            await this.edit(achievementId, achievement);
        }
    }
    
    /**
     * Checks if the user has recorded their first usage entry.
     * Achievement ID: 1 - "First Step"
     * 
     * @param achievements List of all achievements
     * @param usages List of user's usage entries
     */
    private async checkFirstEntry(achievements: AchievementDto[], usages: UsageDto[]) {
        // ID 1: Record your first entry
        const firstEntryAchievement = achievements.find(a => a.id === 1);
        if (firstEntryAchievement && !firstEntryAchievement.completed) {
            const completed = usages.length > 0;
            await this.updateAchievement(1, completed);
        }
    }
    
    /**
     * Checks if the user has achieved various sobriety milestones.
     * Achievement IDs: 
     * - 2: "1 Week Milestone" (7 days)
     * - 3: "1 Month Strong" (30 days)
     * - 5: "3 Month Journey" (90 days)
     * 
     * @param achievements List of all achievements
     * @param usages List of user's usage entries
     */
    private async checkSobrietyAchievements(achievements: AchievementDto[], usages: UsageDto[]) {
        if (usages.length === 0) return;
        
        const now = new Date();
        const lastUsage = usages[usages.length - 1];
        const lastUsageDate = new Date(lastUsage.datetime);
        const daysSinceLastUsage = Math.floor((now.getTime() - lastUsageDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // ID 2: 1 Week Milestone (7 days)
        const weekMilestoneAchievement = achievements.find(a => a.id === 2);
        if (weekMilestoneAchievement) {
            await this.updateAchievement(2, daysSinceLastUsage >= 7);
        }
        
        // ID 3: 1 Month Strong (30 days)
        const monthMilestoneAchievement = achievements.find(a => a.id === 3);
        if (monthMilestoneAchievement) {
            await this.updateAchievement(3, daysSinceLastUsage >= 30);
        }
        
        // ID 5: 3 Month Journey (90 days)
        const threeMonthMilestoneAchievement = achievements.find(a => a.id === 5);
        if (threeMonthMilestoneAchievement) {
            await this.updateAchievement(5, daysSinceLastUsage >= 90);
        }
    }
    
    /**
     * Checks if the user has identified at least 5 different triggers.
     * Achievement ID: 4 - "Trigger Awareness"
     * 
     * @param achievements List of all achievements
     * @param usages List of user's usage entries
     */
    private async checkTriggerAwareness(achievements: AchievementDto[], usages: UsageDto[]) {
        // ID 4: Identify 5 different triggers
        const triggerAwarenessAchievement = achievements.find(a => a.id === 4);
        
        if (triggerAwarenessAchievement && !triggerAwarenessAchievement.completed) {
            // Get unique trigger IDs from all usage entries
            const uniqueTriggerIds = new Set<number>();
            
            for (const usage of usages) {
                if (usage.trigger && Array.isArray(usage.trigger)) {
                    usage.trigger.forEach(trigger => {
                        if (typeof trigger === 'object' && 'id' in trigger) {
                            const aTrigger = trigger as TriggerDto;
                            uniqueTriggerIds.add(aTrigger.id);
                        }
                    });
                }
            }
            
            const completed = uniqueTriggerIds.size >= 5;
            await this.updateAchievement(4, completed);
        }
    }
    
    /**
     * Checks if the user has tried at least 3 different alternative activities.
     * Achievement ID: 6 - "Alternative Explorer"
     * 
     * @param achievements List of all achievements
     */
    private async checkAlternativeActivities(achievements: AchievementDto[]) {
        // ID 6: Try 3 different alternative activities
        const alternativeExplorerAchievement = achievements.find(a => a.id === 6);
        
        if (alternativeExplorerAchievement && !alternativeExplorerAchievement.completed) {
            // Get usageFilling entries to check which alternative activities were used
            const usageFillingTable = this.dbService.getTable('usage_filling' as TableKeys);
            const usageFillings = await usageFillingTable.toArray() as UsageFillingDto[];
            
            const uniqueAlternativeActivityIds = new Set<number>();
            
            for (const filling of usageFillings) {
                if (filling.alternative_activity !== undefined && filling.alternative_activity !== null) {
                    uniqueAlternativeActivityIds.add(filling.alternative_activity as number);
                }
            }
            
            const completed = uniqueAlternativeActivityIds.size >= 3;
            await this.updateAchievement(6, completed);
        }
    }
    
    /**
     * Checks if the user has completed at least 5 breathing exercises.
     * Achievement ID: 7 - "Breathing Master"
     * 
     * @param achievements List of all achievements
     */
    private async checkBreathingExercises(achievements: AchievementDto[]) {
        // ID 7: Complete 5 breathing exercises
        const breathingMasterAchievement = achievements.find(a => a.id === 7);
        
        if (breathingMasterAchievement && !breathingMasterAchievement.completed) {
            // Get usageFilling entries to check breathing exercises
            const usageFillingTable = this.dbService.getTable('usage_filling' as TableKeys);
            const usageFillings = await usageFillingTable.toArray() as UsageFillingDto[];
            
            // Need to check for alternative activities that are breathing exercises (id 1)
            const breathingExerciseCount = usageFillings.filter(filling => 
                filling.alternative_activity === 1
            ).length;
            
            const completed = breathingExerciseCount >= 5;
            await this.updateAchievement(7, completed);
        }
    }
    
    /**
     * Checks motivational factor related achievements:
     * - Adding at least 3 motivational factors (ID 8 - "Motivation Collector")
     * - Using motivational factors to avoid substance use 3 times (ID 9 - "Motivation Driven")
     * 
     * @param achievements List of all achievements
     */
    private async checkMotivationalFactors(achievements: AchievementDto[]) {
        // ID 8: Add 3 motivational factors
        const motivationCollectorAchievement = achievements.find(a => a.id === 8);
        
        if (motivationCollectorAchievement && !motivationCollectorAchievement.completed) {
            const motivationalFactors = await this.motivationalFactorService.list() as MotivationalFactorDto[];
            const completed = motivationalFactors.length >= 3;
            await this.updateAchievement(8, completed);
        }
        
        // ID 9: Use motivational factors to avoid substance use 3 times
        const motivationDrivenAchievement = achievements.find(a => a.id === 9);
        
        if (motivationDrivenAchievement && !motivationDrivenAchievement.completed) {
            const usageFillingTable = this.dbService.getTable('usage_filling' as TableKeys);
            const usageFillings = await usageFillingTable.toArray() as UsageFillingDto[];
            
            // Count times motivational factors were shown and user didn't keep usage
            const motivationalSuccessCount = usageFillings.filter(filling => 
                filling.motivational_factor !== undefined && !filling.kept_usage
            ).length;
            
            const completed = motivationalSuccessCount >= 3;
            await this.updateAchievement(9, completed);
        }
    }
    
    /**
     * Checks if the user has saved at least $100 by avoiding substance use.
     * Achievement ID: 10 - "Money Saver"
     * Calculated by estimating savings based on average daily cost from past usage
     * multiplied by days of sobriety.
     * 
     * @param achievements List of all achievements
     * @param usages List of user's usage entries
     */
    private async checkMoneySaved(achievements: AchievementDto[], usages: UsageDto[]) {
        // ID 10: Save $100 by avoiding substance use
        const moneySaverAchievement = achievements.find(a => a.id === 10);
        
        if (moneySaverAchievement && !moneySaverAchievement.completed && usages.length > 0) {
            const now = new Date();
            const lastUsage = usages[usages.length - 1];
            const lastUsageDate = new Date(lastUsage.datetime);
            const daysSinceLastUsage = Math.floor((now.getTime() - lastUsageDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastUsage === 0) return; // No days of savings yet
            
            // Find all usages before the lastUsage, limited to the same number of days as daysSinceLastUsage
            const previousUsages = usages
                .filter(u => new Date(u.datetime) < lastUsageDate)
                .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
                .slice(0, daysSinceLastUsage);
            
            // Calculate average daily cost from previous usages
            let totalCost = 0;
            for (const usage of previousUsages) {
                if (usage.cost) {
                    totalCost += usage.cost;
                }
            }
            
            // If we have previous costs to calculate an average
            if (previousUsages.length > 0) {
                const averageDailyCost = totalCost / previousUsages.length;
                const estimatedSavings = averageDailyCost * daysSinceLastUsage;
                
                const completed = estimatedSavings >= 100;
                await this.updateAchievement(10, completed);
            }
        }
    }
    
    /**
     * Checks if the user has recorded entries for 10 consecutive days.
     * Achievement ID: 11 - "Consistent Tracker"
     * 
     * @param achievements List of all achievements
     * @param usages List of user's usage entries
     */
    private async checkConsistentTracker(achievements: AchievementDto[], usages: UsageDto[]) {
        // ID 11: Record entries for 10 consecutive days
        const consistentTrackerAchievement = achievements.find(a => a.id === 11);
        
        if (consistentTrackerAchievement && !consistentTrackerAchievement.completed && usages.length >= 10) {
            // Map of dates with entries
            const datesWithEntries = new Map<string, boolean>();
            
            for (const usage of usages) {
                const date = new Date(usage.datetime).toISOString().split('T')[0];
                datesWithEntries.set(date, true);
            }
            
            // Check for 10 consecutive days
            let maxConsecutiveDays = 0;
            let currentStreak = 0;
            
            const dates = Array.from(datesWithEntries.keys()).sort();
            for (let i = 0; i < dates.length; i++) {
                const currentDate = new Date(dates[i]);
                
                if (i > 0) {
                    const prevDate = new Date(dates[i-1]);
                    const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 1) {
                        // Consecutive day
                        currentStreak++;
                    } else {
                        // Break in streak
                        currentStreak = 1;
                    }
                } else {
                    currentStreak = 1;
                }
                
                maxConsecutiveDays = Math.max(maxConsecutiveDays, currentStreak);
            }
            
            const completed = maxConsecutiveDays >= 10;
            await this.updateAchievement(11, completed);
        }
    }
    
    /**
     * Checks if the user has successfully used alternative activities 5 times to avoid substance use.
     * Achievement ID: 12 - "Alternative Success"
     * 
     * @param achievements List of all achievements
     */
    private async checkAlternativeSuccess(achievements: AchievementDto[]) {
        // ID 12: Successfully use alternatives 5 times to avoid substance use
        const alternativeSuccessAchievement = achievements.find(a => a.id === 12);
        
        if (alternativeSuccessAchievement && !alternativeSuccessAchievement.completed) {
            const usageFillingTable = this.dbService.getTable('usage_filling' as TableKeys);
            const usageFillings = await usageFillingTable.toArray() as UsageFillingDto[];
            
            // Count times alternative activities were used and user didn't keep usage
            const alternativeSuccessCount = usageFillings.filter(filling => 
                filling.alternative_activity !== undefined && !filling.kept_usage
            ).length;
            
            const completed = alternativeSuccessCount >= 5;
            await this.updateAchievement(12, completed);
        }
    }

    /**
     * Returns a resource that fetches and sanitizes achievement icons.
     * @param achievements Signal of achievements to fetch icons for
     */
    getAchievementsWithIcon(achievements: InputSignal<AchievementDto[]> | WritableSignal<AchievementDto[]>) {
        return resource<SafeIconAchievement[], AchievementDto[]>({
            request: () => (achievements()),
            loader: ({request}) => {
                const achievements = request;
                let fetchfn;
                if ((window as any).__TAURI__) {
                    fetchfn = tauriFetch;
                } else {
                    fetchfn = fetch;
                }
    
                const saferAchievements: SafeIconAchievement[] = [];
    
                return Promise.all(achievements.map(achievement => {
                    //console.log("Fetching the icon at: ", achievement.icon);
                    return fetchfn(achievement?.icon as string)
                })).then(async (responses): Promise<SafeIconAchievement[]> => {
                    //console.warn("Finished running all the promises", responses);
                    const filledAchievements: number[] = [];
                    return Promise.all(responses.map(async (response, idx) => {
                        const icon = await response.text();
                        //console.warn(`We got the icon text for the icon number ${idx+1}: `, icon);
                        let saferAchievement:SafeIconAchievement = {} as SafeIconAchievement;
                        for (let achievement of achievements) {
                            if (filledAchievements.indexOf(achievement.id) < 0 && response.url.includes(achievement.icon as string)) {
                                achievement.title = this.translate.translate(achievement.title);
                                achievement.description = this.translate.translate(achievement.description);
                                //console.log("Updating saferAchievements: ", achievement);
                                saferAchievement = {...achievement, safeIcon: this.sanitizer.bypassSecurityTrustHtml(icon as string)} as SafeIconAchievement;
                                filledAchievements.push(achievement.id);
                                break;
                            }
                        }
                        return saferAchievement;
                    }));
                });
            }
        });
    }
}
