import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PanelModule } from "primeng/panel";
import { ToastModule } from "primeng/toast";
import { FloatLabelModule } from "primeng/floatlabel";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService, MessageService } from "primeng/api";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";

import { invoke } from "@tauri-apps/api/core";

import { CostService } from "../../services/cost.service";
import { SubstanceService } from "../../services/substance.service";
import { UsageService } from "../../services/usage.service";
import { TriggerService } from "../../services/trigger.service";
import { BackupService } from "../../services/backup.service";
import { CommonModule } from "@angular/common";

interface SaveFileResult {
    path: string;
    msg: string;
    result: boolean;
}

@Component({
    selector: "app-backup",
    standalone: true,
    imports: [
        ButtonModule,
        FormsModule,
        InputTextModule,
        PanelModule,
        ToastModule,
        FloatLabelModule,
        ConfirmDialogModule,
        TranslocoModule,
        CommonModule,
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: "./backup.component.html",
    styleUrl: "./backup.component.scss",
})
export class BackupComponent {
    encryptKey: string;
    encryptedBackup: string;

    decryptKey: string;
    backupString: string;

    filePathDownload: string;

    filePointer: any;

    restoreMode = false;

    constructor(
        private costService: CostService,
        private substanceService: SubstanceService,
        private usageService: UsageService,
        private triggerService: TriggerService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private backupService: BackupService,
        private translateService: TranslocoService
    ) {}

    generateBackup() {
        if (!this.encryptKey || this.encryptKey.length < 6) {
            this.messageService.add({
                summary: this.translateService.translate("Erro"),
                detail: this.translateService.translate(
                    "A senha deve ter pelo menos 6 caracteres."
                ),
                severity: "error",
            });
            return;
        }
        this.backupService.backupData(this.encryptKey).subscribe({
            next: (encryptedBackup) => {
                this.encryptedBackup = encryptedBackup;
                this.messageService.add({
                    summary: this.translateService.translate("Backup gerado"),
                    detail: this.translateService.translate(
                        "Backup gerado com sucesso! Salve este dado em um local seguro."
                    ),
                    severity: "success",
                });
            },
            error: () => {
                this.messageService.add({
                    summary: this.translateService.translate("Erro"),
                    detail: this.translateService.translate(
                        "Erro ao gerar backup."
                    ),
                    severity: "error",
                });
            },
        });
    }

    copyToClipboard(textareaElement: HTMLTextAreaElement) {
        textareaElement.focus();
        textareaElement.select();
        document.execCommand("copy");
        this.messageService.add({
            detail: this.translateService.translate(
                "Backup criptografado copiado com sucesso."
            ),
            summary: this.translateService.translate("Copiado!"),
            severity: "success",
        });
    }

    async saveToFile() {
        const result = (await invoke("save_backup_file", {
            backupStr: this.encryptedBackup,
        })) as SaveFileResult;
        if (result.result) {
            this.messageService.add({
                detail:
                    this.translateService.translate(
                        `Backup criptografado salvo em `
                    ) + result.path,
                summary: result.msg,
                severity: "success",
            });
            this.filePathDownload = result.path;
        } else {
            this.messageService.add({
                detail: this.translateService.translate(
                    `Erro ao salvar {path}: {msg}`,
                    { path: result.path, msg: result.msg }
                ),
                summary: this.translateService.translate(
                    "Erro ao salvar arquivo"
                ),
                severity: "error",
            });
        }
    }

    onFileChange(event: Event) {
        const fileElement = event.target as HTMLInputElement;
        const fileList: FileList | null = fileElement.files;
        if (fileList && fileList.length > 0) {
            this.filePointer = fileList[0];
            const reader = new FileReader();
            reader.readAsText(fileList[0], "UTF-8");
            reader.onload = (evt) => {
                this.backupString = evt.target?.result as string;
            };
        }
    }

    async restoreBackupDialog(event: Event) {
        if (!this.decryptKey || this.decryptKey.length < 6) {
            this.messageService.add({
                summary: this.translateService.translate("Erro"),
                detail: this.translateService.translate(
                    "A senha deve ter pelo menos 6 caracteres."
                ),
                severity: "error",
            });
            return;
        }
        if (!this.backupString && !this.filePointer) {
            this.messageService.add({
                summary: this.translateService.translate("Erro"),
                detail: this.translateService.translate(
                    "Cole o backup criptografado ou selecione um arquivo."
                ),
                severity: "error",
            });
            return;
        }
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: this.translateService.translate(
                "Tem certeza de que deseja restaurar este backup? Seus dados atuais serão apagados e não poderão ser recuperados posteriormente!"
            ),
            header: this.translateService.translate("Confirmação"),
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
                complete: async () => {
                    this.messageService.add({
                        summary: this.translateService.translate(
                            "Restaurado com sucesso!"
                        ),
                        detail: this.translateService.translate(
                            "Seu backup foi restaurado com sucesso! Seus dados já estão disponíveis para consulta."
                        ),
                        severity: "success",
                        life: 4000,
                    });
                },
                error: async () => {
                    this.messageService.add({
                        summary:
                            this.translateService.translate("Erro no backup"),
                        detail: this.translateService.translate(
                            "Não foi possível restaurar seu backup. Por favor, tente novamente!"
                        ),
                        severity: "error",
                        life: 4000,
                    });
                },
            });
    }
}
