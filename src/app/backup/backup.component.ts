import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AES, enc } from 'crypto-js';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';


import { CostService } from '../services/cost.service';
import { CostDto } from '../dto/cost.dto';
import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { UsageService } from '../services/usage.service';
import { UsageDto } from '../dto/usage.dto';
import { TriggerService } from '../services/trigger.service';
import { TriggerDto } from '../dto/trigger.dto';

interface BackupData {
    cost: CostDto[];
    substance: SubstanceDto[];
    usage: UsageDto[];
    trigger: TriggerDto[];
}

@Component({
    selector: 'app-backup',
    standalone: true,
    imports: [
        ButtonModule,
        FormsModule,
        InputTextModule,
        PanelModule,
        ToastModule,
        FloatLabelModule,
        ConfirmDialogModule,
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './backup.component.html',
    styleUrl: './backup.component.scss'
})
export class BackupComponent {

    encriptKey: string;
    encryptedBackup: string;

    decriptKey: string;
    backupString: string;

    constructor(
        private costService: CostService<CostDto>,
        private substanceService: SubstanceService<SubstanceDto>,
        private usageService: UsageService<UsageDto>,
        private triggerService: TriggerService<TriggerDto>,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
    ) {}
    
    generateBackup() {
        let backupObj: BackupData;

        this.costService.clearCache();
        this.substanceService.clearCache();
        this.usageService.clearCache();
        this.triggerService.clearCache();

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
                const encryptedBackup = AES.encrypt(jsonBackup, this.encriptKey);
                this.encryptedBackup = encryptedBackup.toString();
            },
            error: (err) => {
                console.error(err);
            }
        });
        console.log("Backup generated");
    }

    copyToClipboard(textareaElement: HTMLTextAreaElement) {
        textareaElement.focus();
        textareaElement.select();
        document.execCommand('copy');
        this.messageService.add({
            detail: "Backup criptografado copiado com sucesso.",
            summary: "Copiado!",
            severity: "success"
        })
    }

    restoreBackupDialog(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: "Tem certeza de que deseja restaurar este backup? Seus dados atuais serão apagados e não poderão ser recuperados posteriormente!",
            header: "Confirmação",
            icon: "pi pi-exclamation-triangle",
            accept: () => {
                this.restoreBackup();
            },
        });
    }
    
    restoreBackup() {
        let jsonBackup;
        try {
            const decryptedBackup = AES.decrypt(this.backupString, this.decriptKey);
            console.log(decryptedBackup.toString(enc.Utf8));
            jsonBackup = JSON.parse(decryptedBackup.toString(enc.Utf8)) as BackupData;
        } catch (error) {
            this.messageService.add({
                summary: "Erro no backup",
                detail: "Não foi possível restaurar seu backup. Tem certeza de que a senha está correta?",
                severity: "error",
                life: 4000,
            });
            console.error(error);
            return;
        }
        jsonBackup = this.rehydrateDateFields(jsonBackup);
        console.log("Resultado: ", jsonBackup);
        
        // everything ok, lets restore the backup
        this.triggerService.clear();
        this.usageService.clear();
        this.substanceService.clear();
        this.costService.clear();

        const savedData$ = forkJoin({
            substance: this.substanceService.bulkAdd(jsonBackup.substance),
            trigger: this.triggerService.bulkAdd(jsonBackup.trigger),
            usage: this.usageService.bulkAdd(jsonBackup.usage),
            cost: this.costService.bulkAdd(jsonBackup.cost)
        });

        savedData$.subscribe({
            next: (result) => {
                console.log("Emitindo o próximo", result);
            },
            complete: () =>  {
                this.messageService.add({
                    summary: "Restaurado com sucesso!",
                    detail: "Seu backup foi restaurado com sucesso! Seus dados já estão disponíveis para consulta.",
                    severity: "success",
                    life: 4000,
                });
            },
            error: () => {
                this.messageService.add({
                    summary: "Erro no backup",
                    detail: "Não foi possível restaurar seu backup. Por favor, tente novamente!",
                    severity: "error",
                    life: 4000,
                });
            }
        })
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
