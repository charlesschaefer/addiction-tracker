import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { FloatLabelModule } from 'primeng/floatlabel';

import { SubstanceAddDto } from '../dto/substance.dto';
import { SubstanceService } from '../services/substance.service';
import { Message } from 'primeng/api';

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
    ],
    templateUrl: './substance-add.component.html',
    styleUrl: './substance-add.component.scss'
})
export class SubstanceAddComponent {
    private fb = inject(FormBuilder);
    errorMessage: Message[] = [{severity: "error", detail: "Verifique todos os campos do formulário"}];
    substanceForm = this.fb.group({
        name: [null, Validators.required],
    });
    
    constructor(
        private substanceService: SubstanceService<SubstanceAddDto>,
        private snackBar: MatSnackBar,
        private router: Router,
    ) {}
    
    onSubmit() {
        if (!this.substanceForm.valid) {
            this.snackBar.open("Verifique todos os valores do formulário", "Fechar");
            return;
        }
        let data: SubstanceAddDto = {
            name: this.substanceForm.value.name || ''
        };
        this.substanceService.add(data).subscribe(values => console.log(`Values: ${values}`));
        this.router.navigate(['/']);
    }
}
