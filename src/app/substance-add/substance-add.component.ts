import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { FloatLabelModule } from 'primeng/floatlabel';
import { Toast, ToastModule } from 'primeng/toast';

import { SubstanceAddDto } from '../dto/substance.dto';
import { SubstanceService } from '../services/substance.service';
import { Message, MessageService } from 'primeng/api';

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
    ],
    templateUrl: './substance-add.component.html',
    styleUrl: './substance-add.component.scss',
    providers: [MessageService],
})
export class SubstanceAddComponent {
    private fb = inject(FormBuilder);
    errorMessage: Message[] = [{severity: "error", detail: "Verifique todos os valores do formulário"}];
    substanceForm = this.fb.group({
        name: [null, Validators.required],
    });
    
    constructor(
        private substanceService: SubstanceService<SubstanceAddDto>,
        private snackBar: MatSnackBar,
        private router: Router,
        private messageService: MessageService,
    ) {}
    
    async onSubmit() {
        if (!this.substanceForm.valid) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Verifique todos os valores do formulário", life: 3000 });
            return;
        }
        let data: SubstanceAddDto = {
            name: this.substanceForm.value.name || ''
        };
        this.substanceService.add(data).subscribe(values => {
            this.messageService.add({ severity: 'success', summary: 'Tudo certo', detail: 'Substância salva com sucesso!', life: 3000})
            setTimeout(() => {
                this.router.navigate(['/']);
            }, 3000);
        });
        
    }
}
