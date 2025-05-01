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

/**
 * Structure for backup data.
 */
export interface BackupData {
    cost: CostDto[];
    substance: SubstanceDto[];
    usage: UsageDto[];
    trigger: TriggerDto[];
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

        const backupSubject$ = new Subject<string>();

        const backupData$ = forkJoin({
            cost: this.costService.list(),
            substance: this.substanceService.list(),
            usage: this.usageService.list(),
            trigger: this.triggerService.list(),
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

        const backupResponse$ = new Subject();

        this.substanceService.bulkAdd(jsonBackup.substance).then(() => {
            console.log("Chamou o next")
        }).finally(() => {
                console.log("Adicionou substance")
                this.triggerService.bulkAdd(jsonBackup.trigger).then(() => {
                    console.log("Adicionou trigger")
                    this.usageService.bulkAdd(jsonBackup.usage).then(() => {
                        console.log("Adicionou usage")
                        this.costService.bulkAdd(jsonBackup.cost).then(() => {
                            console.log("Adicionou cost")
                            backupResponse$.complete();
                        })
                    })
                })
            }).catch((err) => {
                console.log("Errro: ", err);
            });

        return backupResponse$;

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
