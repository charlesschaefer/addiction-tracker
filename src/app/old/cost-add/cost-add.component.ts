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
import { JoyrideModule } from 'ngx-joyride';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { SubstanceDto } from '../../dto/substance.dto';
import { CostAddDto } from '../../dto/cost.dto';
import { SubstanceService } from '../../services/substance.service';
import { CostService } from '../../services/cost.service';

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
        JoyrideModule,
        TranslocoModule,
    ],
    providers: [MessageService],
    templateUrl: './cost-add.component.html',
    styleUrl: './cost-add.component.scss'
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
        private substanceService: SubstanceService,
        private costAddService: CostService,
        private messageService: MessageService,
        private router: Router,
        private translateService: TranslocoService,
    ) {}
    
    ngOnInit() {
        this.substanceService.list().then(substances => this.substances = substances as SubstanceDto[]);
    }
    
    async onSubmit() {
        if (!this.costForm.valid) {
            this.messageService.add({
                severity: 'error',
                summary: this.translateService.translate('Erro'),
                detail: this.translateService.translate('Verifique todos os valores do formulário'),
                life: 3000
            });
            return;
        }
        const form = this.costForm.value;

        const data: CostAddDto = {
            value: form.value || 0,
            substance: form.substance || 0,
            date: form.date || new Date()
        };

        this.costAddService.add(data).then(async value => {
                this.costAddService.clearCache();
                this.messageService.add({ 
                    severity: 'success', 
                    summary: this.translateService.translate('Tudo certo'), 
                    detail: this.translateService.translate('Gasto salvo com sucesso!'), 
                    life: 2000
                });

                setTimeout(() => {
                    this.router.navigate(['/cost']);
                }, 2000);
            }).catch(async error => {
                this.messageService.add({ 
                    severity: 'error', 
                    summary: this.translateService.translate('Erro'), 
                    detail: this.translateService.translate('Houve um erro ao salvar o gasto!'), 
                    life: 2000
                });
            });
    }
    
}
