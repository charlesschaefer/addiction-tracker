import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { JoyrideModule } from 'ngx-joyride';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { SubstanceAddDto } from '../dto/substance.dto';
import { SubstanceService } from '../services/substance.service';

@Component({
    selector: 'app-substance-add',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        PanelModule,
        InputTextModule,
        ButtonModule,
        MessagesModule,
        FloatLabelModule,
        ToastModule,
        TooltipModule,
        JoyrideModule,
        TranslocoModule,
    ],
    templateUrl: './substance-add.component.html',
    styleUrl: './substance-add.component.scss',
    providers: [MessageService]
})
export class SubstanceAddComponent {
    private fb = inject(FormBuilder);
    substanceForm = this.fb.group({
        name: [null, Validators.required],
    });
    formSubmitted = false;
    
    constructor(
        private substanceService: SubstanceService,
        private snackBar: MatSnackBar,
        private router: Router,
        private messageService: MessageService,
        private translateService: TranslocoService,
    ) {}
    
    async onSubmit() {
        this.formSubmitted = true;
        if (!this.substanceForm.valid) {
            this.messageService.add({ 
                severity: 'error', 
                summary: this.translateService.translate('Erro'), 
                detail: this.translateService.translate("Verifique todos os valores do formulário"), 
                life: 3000 
            });
            return;
        }

        const substances = await this.substanceService.getByField('name', this.substanceForm.value.name);
        if (substances.length) {
            this.messageService.add({ 
                severity: 'error', 
                summary: this.translateService.translate('Entrada duplicada'), 
                detail: this.translateService.translate('Já existe essa substância'), 
                life: 3000
            });
            return;
        }
        const data: SubstanceAddDto = {
            name: this.substanceForm.value.name || ''
        };
        this.substanceService.add(data).then(async (values) => {
                this.substanceService.clearCache();
                this.messageService.add({ 
                    severity: 'success', 
                    summary: this.translateService.translate('Tudo certo'), 
                    detail: this.translateService.translate('Substância salva com sucesso!'), 
                    life: 2000
                });

                setTimeout(() => {
                    this.router.navigate(['/']);
                }, 2000);
            }).catch(async (error) => {
                this.messageService.add({ 
                    severity: 'error', 
                    summary: this.translateService.translate('Erro'), 
                    detail: this.translateService.translate('Houve um erro ao salvar a substância! ') + error, 
                    life: 2000
                });
            });
    }
}
