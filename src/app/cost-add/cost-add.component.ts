import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { MessageService } from 'primeng/api';

import { SubstanceDto } from '../dto/substance.dto';
import { CostAddDto, CostDto } from '../dto/cost.dto';
import { SubstanceService } from '../services/substance.service';
import { CostService } from '../services/cost.service';
import { DateTime } from 'luxon';

@Component({
    selector: 'app-cost-add',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        PanelModule,
        InputTextModule,
        ButtonModule,
        FloatLabelModule,
        DropdownModule,
        CalendarModule,
        ToastModule,
        InputNumberModule,
        InputMaskModule,
    ],
    providers: [MessageService],
    templateUrl: './cost-add.component.html',
    styleUrl: './cost-add.component.scss',
})
export class CostAddComponent implements OnInit {
    private fb = inject(FormBuilder);
    costForm = this.fb.group({
        substance: [null, Validators.required],
        value: [null, Validators.required],
        date: [null, Validators.required],
    })
    substances: SubstanceDto[];

    constructor(
        private substanceService: SubstanceService<SubstanceDto>,
        private costAddService: CostService<CostAddDto>,
        private messageService: MessageService,
        private router: Router,
    ) {}
    
    ngOnInit() {
        this.substanceService.list().subscribe(substances => this.substances = substances);
    }
    
    onSubmit() {
        if (!this.costForm.valid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Verifique todos os valores do formulário',
                life: 3000
            });
            return;
        }
        let form = this.costForm.value;

        let data: CostAddDto = {
            value: form.value || 0,
            substance: form.substance || 0,
            date: form.date || new Date()
        };

        this.costAddService.add(data).subscribe({
            next: value => {
                this.costAddService.clearCache();
                this.messageService.add({ 
                    severity: 'success', 
                    summary: 'Tudo certo', 
                    detail: 'Gasto salvo com sucesso!', 
                    life: 2000
                });

                setTimeout(() => {
                    this.router.navigate(['/cost']);
                }, 2000);
            },
            error: error => {
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Erro', 
                    detail: 'Houve um erro ao salvar o gasto!', 
                    life: 2000
                });
            }
        });
    }
    
}