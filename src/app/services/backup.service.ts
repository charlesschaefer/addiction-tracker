import { AES, enc } from 'crypto-js';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, Subject } from 'rxjs';
import { CostService } from './cost.service';
import { CostDto } from '../dto/cost.dto';
import { SubstanceService } from './substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { UsageDto } from '../dto/usage.dto';
import { UsageService } from './usage.service';
import { TriggerService } from './trigger.service';
import { TriggerDto } from '../dto/trigger.dto';

export interface BackupData {
    cost: CostDto[];
    substance: SubstanceDto[];
    usage: UsageDto[];
    trigger: TriggerDto[];
}

@Injectable({
    providedIn: 'root'
})
export class BackupService {
    
    encryptedBackup: string;

    constructor(
        private costService: CostService<CostDto>,
        private substanceService: SubstanceService<SubstanceDto>,
        private usageService: UsageService<UsageDto>,
        private triggerService: TriggerService<TriggerDto>,
    ) { }
    
    backupData(encryptKey: string): Subject<string> {
        let backupObj: BackupData;
        
        this.costService.clearCache();
        this.substanceService.clearCache();
        this.usageService.clearCache();
        this.triggerService.clearCache();

        let backupSubject$ = new Subject<string>();

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

        // const savedData$ = forkJoin({
        //     substance: this.substanceService.bulkAdd(jsonBackup.substance),
        //     trigger: this.triggerService.bulkAdd(jsonBackup.trigger),
        //     usage: this.usageService.bulkAdd(jsonBackup.usage),
        //     cost: this.costService.bulkAdd(jsonBackup.cost)
        // });
        const backupResponse$ = new Subject();

        this.substanceService.bulkAdd(jsonBackup.substance).subscribe({
            complete: () => {
                console.log("Adicionou substance")
                this.triggerService.bulkAdd(jsonBackup.trigger).subscribe(() => {
                    console.log("Adicionou trigger")
                    this.usageService.bulkAdd(jsonBackup.usage).subscribe(() => {
                        console.log("Adicionou usage")
                        this.costService.bulkAdd(jsonBackup.cost).subscribe(() => {
                            console.log("Adicionou cost")
                            backupResponse$.complete();
                        })
                    })
                })
            }, 
            next: () => {
                console.log("Chamou o next")
            },
            error: (err) => {
                console.log("Errro: ", err);
            }
        });


        // savedData$.subscribe({
        //     next: (result) => {
        //         console.log("Emitindo o próximo", result);
        //     },
        //     complete: () =>  {
        //         console.log("Finished restauring the backup");
        //         backupResponse$.complete();
        //     },
        //     error: (err) => {
        //         console.log("Couldn't save the backup: ", err);
        //         backupResponse$.error(err);
        //     }
        // });

        return backupResponse$;

    }

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
