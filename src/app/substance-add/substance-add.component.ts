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
import { Message, MessageService } from 'primeng/api';
import { EMPTY, Observable, concatMap, firstValueFrom } from 'rxjs';
import { JoyrideModule } from 'ngx-joyride';

import { SubstanceAddDto, SubstanceDto } from '../dto/substance.dto';
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
    ],
    templateUrl: './substance-add.component.html',
    styleUrl: './substance-add.component.scss',
    providers: [MessageService],
})
export class SubstanceAddComponent {
    private fb = inject(FormBuilder);
    substanceForm = this.fb.group({
        name: [null, Validators.required],
    });
    formSubmitted = false;
    
    constructor(
        private substanceService: SubstanceService<SubstanceAddDto>,
        private snackBar: MatSnackBar,
        private router: Router,
        private messageService: MessageService,
    ) {}
    
    async onSubmit() {
        this.formSubmitted = true;
        if (!this.substanceForm.valid) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Verifique todos os valores do formulário", life: 3000 });
            return;
        }

        let substances = await firstValueFrom(this.substanceService.getByField('name', this.substanceForm.value.name));
        if (substances.length) {
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Entrada duplicada', 
                detail: 'Já existe essa substância', 
                life: 3000
            });
            return;
        }
        let data: SubstanceAddDto = {
            name: this.substanceForm.value.name || ''
        };
        this.substanceService.add(data).subscribe({
            next: (values) => {
                this.substanceService.clearCache();
                this.messageService.add({ 
                    severity: 'success', 
                    summary: 'Tudo certo', 
                    detail: 'Substância salva com sucesso!', 
                    life: 2000
                });

                setTimeout(() => {
                    this.router.navigate(['/']);
                }, 2000);
            },
            error: (error) => {
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Erro', 
                    detail: 'Houve um erro ao salvar a substância! ' + error, 
                    life: 2000
                });
            }
        });
    }
}
