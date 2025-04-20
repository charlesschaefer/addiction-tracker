import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { invoke } from '@tauri-apps/api/core';


import { CostService } from '../services/cost.service';
import { CostDto } from '../dto/cost.dto';
import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { UsageService } from '../services/usage.service';
import { UsageDto } from '../dto/usage.dto';
import { TriggerService } from '../services/trigger.service';
import { TriggerDto } from '../dto/trigger.dto';
import { BackupService } from '../services/backup.service';

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
        TranslateModule
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
        private costService: CostService,
        private substanceService: SubstanceService,
        private usageService: UsageService,
        private triggerService: TriggerService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private backupService: BackupService,
        private translate: TranslateService,
    ) {}
    
    generateBackup() {
        this.backupService.backupData(this.encryptKey).subscribe((encryptedBackup) => {
            this.encryptedBackup = encryptedBackup;
        });
        console.log("Backup generated");
    }

    async copyToClipboard(textareaElement: HTMLTextAreaElement) {
        textareaElement.focus();
        textareaElement.select();
        document.execCommand('copy');
        this.messageService.add({
            detail: await firstValueFrom(this.translate.get("Backup criptografado copiado com sucesso.")),
            summary: await firstValueFrom(this.translate.get("Copiado!")),
            severity: "success"
        })
    }

    async saveToFile() {
        const result = await invoke("save_backup_file", { backupStr: this.encryptedBackup}) as SaveFileResult;
        if (result.result) {
            this.messageService.add({
                detail: await firstValueFrom(this.translate.get(`Backup criptografado salvo em `)) + result.path,
                summary: result.msg,
                severity: "success"
            });
            this.filePathDownload = result.path;
        } else {
            this.messageService.add({
                detail: await firstValueFrom(this.translate.get(`Erro ao salvar {path}: {msg}`, {path: result.path, msg: result.msg})),
                summary: await firstValueFrom(this.translate.get("Erro ao salvar arquivo")),
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

    async restoreBackupDialog(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: await firstValueFrom(this.translate.get("Tem certeza de que deseja restaurar este backup? Seus dados atuais serão apagados e não poderão ser recuperados posteriormente!")),
            header: await firstValueFrom(this.translate.get("Confirmação")),
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
                complete: async () =>  {
                    this.messageService.add({
                        summary: await firstValueFrom(this.translate.get("Restaurado com sucesso!")),
                        detail: await firstValueFrom(this.translate.get("Seu backup foi restaurado com sucesso! Seus dados já estão disponíveis para consulta.")),
                        severity: "success",
                        life: 4000,
                    });
                },
                error: async () => {
                    this.messageService.add({
                        summary: await firstValueFrom(this.translate.get("Erro no backup")),
                        detail: await firstValueFrom(this.translate.get("Não foi possível restaurar seu backup. Por favor, tente novamente!")),
                        severity: "error",
                        life: 4000,
                    });
                }
            });
    }
}
