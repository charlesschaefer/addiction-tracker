import { Component } from '@angular/core';
import { invoke } from '@tauri-apps/api/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputOtpModule } from 'primeng/inputotp';
import { AES } from 'crypto-js';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';

import { OtpGeneratorService } from '../services/otp-generator.service';
import { BackupService } from '../services/backup.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
    selector: 'app-synchronization',
    standalone: true,
    imports: [
        DialogModule,
        ButtonModule,
        CommonModule,
        ReactiveFormsModule,
        InputOtpModule,
        ToastModule,
        TranslocoModule,
        PanelModule
    ],
    providers: [
        MessageService
    ],
    templateUrl: './synchronization.component.html',
    styleUrl: './synchronization.component.scss'
})
export class SynchronizationComponent {
    getFromOthersVisible = false;
    sendToOthersVisible = false;

    otpData!: string;
    serverIp!: string;

    enableDiscoverButton = true;
    showOTPField = false;

    fb = new FormBuilder();
    otpForm = this.fb.group({
        otp: ["", Validators.minLength(6)]
    });

    constructor(
        private otpGenerator: OtpGeneratorService,
        private backupService: BackupService,
        private httpClient: HttpClient,
        private messageService: MessageService,
        private translateService: TranslocoService,
    ) {}

    openFromOthers() {
        this.getFromOthersVisible = true;
        this.sendToOthersVisible = false;
    }

    openToOthers() {
        this.sendToOthersVisible = true;
        this.getFromOthersVisible = false;
    }

    makeDeviceDiscoverable() {
        // generates OTP code
        const otp = this.otpGenerator.generateOTP();
        this.otpData = otp;
        this.backupService.backupData(otp).subscribe(cryptedBackup => {
            invoke('broadcast_network_sync_services').then(() => {
                invoke('start_http_server', { otpCode: otp, backupData: cryptedBackup });
            });
        });
    }

    discoverDevices() {
        this.enableDiscoverButton = false;
        this.showOTPField = true;
        console.log("Let's search other devices...");
        // get devices with faire opened in the network
        invoke('search_network_sync_services').then(async (ipv4) => {
            console.log("Device found at ", ipv4);
            this.messageService.add({
                summary: this.translateService.translate("Device found"),
                detail: this.translateService.translate("Your device was discovered with the IP: ") + ipv4,
                severity: "info"
            });
            this.showOTPField = true;
            this.serverIp = ipv4 as string;
        });
    }

    sendEncryptedOTP(event: Event) {
        console.log("Sending encripted data. OTP: ", this.otpForm.value.otp);
        const otp = this.otpForm.value.otp as unknown as string;
        
        // encrypts the otp and sends to the server 
        const encryptedOtp = AES.encrypt(otp , otp);
        const options = {
            headers: {
                'X-SIGNED-TOKEN': encryptedOtp.toString()
            },
            responseType: 'text' as 'json' // HACK because angular @types has the type of responseType fixed as 'json' :shrug:
        };

        this.httpClient.post<string>(`http://${this.serverIp}:9099/handshake`, {}, options).subscribe(backupData => {
            console.log("Data sent and backup received. Restoring backup...")
            this.backupService.restoreBackup(backupData, otp).subscribe({
                complete: async () => {
                    console.log("Backup restored. Showing messages");
                    this.messageService.add({
                        summary: this.translateService.translate("Sincronizado com sucesso"),
                        detail: this.translateService.translate("Seus dados foram sincronizados com sucesso."),
                        severity: "success",
                        life: 4000,
                    });
                    await this.httpClient.post(`http://${this.serverIp}:9099/disconnect`, {});
                },
                error: async (err) => {
                    console.log("Error recovering backup. Showing messages...", err);
                    this.messageService.add({
                        summary: this.translateService.translate("Erro Sincronizando"),
                        detail: this.translateService.translate(`Erro ao tentar sincronizar os dados: `) + err.toString()
                    });
                }
            });
        });
    }
}
