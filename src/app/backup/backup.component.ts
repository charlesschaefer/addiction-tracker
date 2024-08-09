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

import { invoke } from '@tauri-apps/api/core';


import { CostService } from '../services/cost.service';
import { CostDto } from '../dto/cost.dto';
import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { UsageService } from '../services/usage.service';
import { UsageDto } from '../dto/usage.dto';
import { TriggerService } from '../services/trigger.service';
import { TriggerDto } from '../dto/trigger.dto';
import { BackupService, BackupData } from '../services/backup.service';

interface SaveFileResult {
    path: string;
    msg: string;
    result: boolean;
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

    encryptKey: string;
    encryptedBackup: string;

    decryptKey: string;
    backupString: string;

    filePathDownload: string;

    filePointer: any;

    constructor(
        private costService: CostService<CostDto>,
        private substanceService: SubstanceService<SubstanceDto>,
        private usageService: UsageService<UsageDto>,
        private triggerService: TriggerService<TriggerDto>,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private backupService: BackupService,
    ) {}
    
    generateBackup() {
        this.backupService.backupData(this.encryptKey).subscribe((encryptedBackup) => {
            this.encryptedBackup = encryptedBackup;
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

    async saveToFile() {
        const result = await invoke("save_backup_file", { backupStr: this.encryptedBackup}) as SaveFileResult;
        if (result.result) {
            this.messageService.add({
                detail: `Backup criptografado salvo em ${result.path}.`,
                summary: result.msg,
                severity: "success"
            });
            this.filePathDownload = result.path;
        } else {
            this.messageService.add({
                detail: `Erro ao salvar ${result.path}: ${result.msg}`,
                summary: "Erro ao salvar arquivo",
                severity: "error"
            });
        }
    }

    onFileChange(event: Event) {
        const fileElement = event.target as HTMLInputElement;
        const fileList: FileList | null = fileElement.files;
        if (fileList) {
            const reader = new FileReader();
            reader.readAsText(fileList[0], "UTF-8");
            reader.onload = (evt) => {
                this.backupString = evt.target?.result as string;
            }
        }
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
        this.backupService
            .restoreBackup(this.backupString, this.decryptKey)
            .subscribe({
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
            });
    }
}
