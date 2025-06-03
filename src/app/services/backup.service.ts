import { AES, enc } from 'crypto-js';
import { Injectable } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { CostService } from './cost.service';
import { CostDto } from '../dto/cost.dto';
import { SubstanceService } from './substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { UsageDto } from '../dto/usage.dto';
import { UsageService } from './usage.service';
import { TriggerService } from './trigger.service';
import { TriggerDto } from '../dto/trigger.dto';
import { RecommendationDto } from '../dto/recommendation.dto';
import { AlternativeActivityDto } from '../dto/alternative-activity.dto';
import { MotivationalFactorDto } from '../dto/motivational-factor.dto';
import { AchievementDto } from '../dto/achievement.dto';
import { UsageFillingDto } from '../dto/usage-filling.dto';
import { RecommendationService } from './recommendation.service';
import { AlternativeActivityService } from './alternative-activity.service';
import { MotivationalFactorService } from './motivational-factor.service';
import { UsageFillingService } from './usage-filling.service';
import { AchievementService } from './achievement.service';
import { union, unique } from 'underscore';

/**
 * Structure for backup data.
 */
export interface BackupData {
    cost: CostDto[];
    substance: SubstanceDto[];
    usage: UsageDto[];
    trigger: TriggerDto[];
    recommendation: RecommendationDto[];
    alternative_activity: AlternativeActivityDto[];
    motivational_factor: MotivationalFactorDto[];
    usage_filling: UsageFillingDto[];
    achievement: AchievementDto[];
}

/**
 * Service for handling backup and restore of user data.
 */
@Injectable({
    providedIn: 'root'
})
export class BackupService {
    /** Holds the encrypted backup string. */
    encryptedBackup: string;

    /**
     * Injects required services for backup/restore.
     */
    constructor(
        private costService: CostService,
        private substanceService: SubstanceService,
        private usageService: UsageService,
        private triggerService: TriggerService,
        private recommendationService: RecommendationService,
        private alternativeActivityService: AlternativeActivityService,
        private motivationalFactorService: MotivationalFactorService,
        private usageFillingService: UsageFillingService,
        private achievementService: AchievementService,
    ) { }
    
    /**
     * Creates a backup of all user data, encrypts it, and returns a Subject with the encrypted string.
     * @param encryptKey Encryption key
     */
    backupData(encryptKey: string): Subject<string> {
        let backupObj: BackupData;
        
        this.costService.clearCache();
        this.substanceService.clearCache();
        this.usageService.clearCache();
        this.triggerService.clearCache();
        this.recommendationService.clearCache();
        this.alternativeActivityService.clearCache();
        this.motivationalFactorService.clearCache();
        this.usageFillingService.clearCache();
        this.achievementService.clearCache();

        const backupSubject$ = new Subject<string>();

        const backupData$ = forkJoin({
            cost: this.costService.list(),
            substance: this.substanceService.list(),
            usage: this.usageService.list(),
            trigger: this.triggerService.list(),
            recommendation: this.recommendationService.list(),
            alternative_activity: this.alternativeActivityService.list(),
            motivational_factor: this.motivationalFactorService.list(),
            usage_filling: this.usageFillingService.list(),
            achievement: this.achievementService.list(),
        });

        backupData$.subscribe({
            next: (result) => {
                backupObj = result as BackupData;
            },
            complete: () => {
                const jsonBackup = JSON.stringify(backupObj);
                const encryptedBackup = AES.encrypt(jsonBackup, encryptKey);
                backupSubject$.next(encryptedBackup.toString());
            },
            error: (err) => {
                console.error(err);
            }
        });
        console.log("Backup generated");

        return backupSubject$;
    }

    /**
     * Restores backup data from an encrypted string.
     * @param encryptedData Encrypted backup string
     * @param decryptKey Decryption key
     */
    restoreBackup(encryptedData: string, decryptKey: string) {
        let jsonBackup;
        console.log("Encrypted data: ", encryptedData, "decryptKey", decryptKey);
        try {
            const decryptedBackup = AES.decrypt(encryptedData, decryptKey);
            
            console.log("Received the data and here it is after decrypting: ");
            console.log(decryptedBackup.toString(enc.Utf8));
            console.log("Total bytes: ", decryptedBackup.toString(enc.Utf8).length);
            jsonBackup = JSON.parse(decryptedBackup.toString(enc.Utf8)) as BackupData;
        } catch (error) {
            console.log("Error trying to decrypt or convert json: ", error);
            throw error;
        }
        jsonBackup = this.rehydrateDateFields(jsonBackup);
        console.log("Resultado: ", jsonBackup);

        // everything ok, lets restore the backup
        this.triggerService.clear();
        this.usageService.clear();
        this.substanceService.clear();
        this.costService.clear(); 
        this.recommendationService.clear();
        this.alternativeActivityService.clear();
        this.motivationalFactorService.clear();
        this.usageFillingService.clear();
        this.achievementService.clear();

        jsonBackup.substance = jsonBackup.substance ?? [];
        jsonBackup.trigger = jsonBackup.trigger ?? [];
        jsonBackup.usage = jsonBackup.usage ?? [];
        jsonBackup.cost = jsonBackup.cost ?? [];
        jsonBackup.recommendation = jsonBackup.recommendation ?? [];
        jsonBackup.alternative_activity = jsonBackup.alternative_activity ?? [];
        jsonBackup.motivational_factor = jsonBackup.motivational_factor ?? [];
        jsonBackup.usage_filling = jsonBackup.usage_filling ?? [];
        jsonBackup.achievement = jsonBackup.achievement ?? [];

        const backupResponse$ = new Subject();

        Promise.all([
            this.substanceService.bulkAdd(jsonBackup.substance),
            this.triggerService.bulkAdd(jsonBackup.trigger),
            this.usageService.bulkAdd(jsonBackup.usage),
            this.costService.bulkAdd(jsonBackup.cost),
            this.recommendationService.bulkAdd(jsonBackup.recommendation),
            this.alternativeActivityService.bulkAdd(jsonBackup.alternative_activity),
            this.motivationalFactorService.bulkAdd(jsonBackup.motivational_factor),
            this.usageFillingService.bulkAdd(jsonBackup.usage_filling),
            this.achievementService.bulkAdd(jsonBackup.achievement),
        ]).then(() => {
            console.log("All data added successfully.");
            backupResponse$.complete();
        }).catch((err) => {
            console.error("Error adding data in bulk:", err);
            backupResponse$.error(err);
        });

        return backupResponse$;
    }

    /**
     * Faz merge dos dados do backup com os dados locais usando json-merger.
     * @param encryptedData Encrypted backup string
     * @param decryptKey Decryption key
     * @returns Subject que completa quando o merge termina
     */
    mergeBackup(encryptedData: string, decryptKey: string) {
        let jsonBackup: BackupData;
        const mergeResponse$ = new Subject();

        try {
            const decryptedBackup = AES.decrypt(encryptedData, decryptKey);
            jsonBackup = JSON.parse(decryptedBackup.toString(enc.Utf8)) as BackupData;
        } catch (error) {
            console.log("Error trying to decrypt or convert json: ", error);
            mergeResponse$.error(error);
            return mergeResponse$;
        }
        jsonBackup = this.rehydrateDateFields(jsonBackup);

        // Lista de tabelas e serviços correspondentes
        const tables: Array<{
            key: keyof BackupData,
            service: { list: () => Promise<any[]>, bulkPut: (data: any[]) => Promise<any>, clear: () => Promise<any> }
        }> = [
            { key: 'substance', service: this.substanceService },
            { key: 'trigger', service: this.triggerService },
            { key: 'usage', service: this.usageService },
            { key: 'cost', service: this.costService },
            { key: 'recommendation', service: this.recommendationService },
            { key: 'alternative_activity', service: this.alternativeActivityService },
            { key: 'motivational_factor', service: this.motivationalFactorService },
            { key: 'usage_filling', service: this.usageFillingService },
            { key: 'achievement', service: this.achievementService },
        ];

        // Executa o merge em transação sequencial
        (async () => {
            try {
                for (const { key, service } of tables) {
                    // 1. Consulta os dados locais
                    const localData = await service.list();
                    // 2. Faz o merge usando json-merger
                    const merged = unique([...localData, ...(jsonBackup[key] ?? [])]);
                    // 3. Limpa a tabela e insere os dados mesclados
                    await service.clear();
                    await service.bulkPut(merged as any);
                    console.log(`Merged data (rows) for ${key}:`, merged?.length);
                }
                mergeResponse$.complete();
            } catch (err) {
                console.error("Error merging backup data:", err);
                mergeResponse$.error(err);
            }
        })();

        return mergeResponse$;
    }

    /**
     * Converts date fields in backup data from string to Date objects.
     * @param jsonBackup Backup data object
     */
    rehydrateDateFields(jsonBackup: BackupData): BackupData {
        jsonBackup.cost.forEach((value, index) => {
            jsonBackup.cost[index].date = new Date(value.date);
        });

        jsonBackup.usage.forEach((value, index) => {
            jsonBackup.usage[index].datetime = new Date(value.datetime);
        });

        return jsonBackup;
    }
}
