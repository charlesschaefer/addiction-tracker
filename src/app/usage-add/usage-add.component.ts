import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { ListboxModule } from 'primeng/listbox';
import { MessagesModule } from 'primeng/messages';
import { MessageService } from 'primeng/api';
import { JoyrideModule } from 'ngx-joyride';


import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { UsageService } from '../services/usage.service';
import { UsageAddDto, UsageDto } from '../dto/usage.dto';
import { TriggerService } from '../services/trigger.service';
import { TriggerAddDto, TriggerDto } from '../dto/trigger.dto';
import { firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-usage-add',
    standalone: true,
    imports: [
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatCardModule,
        MatSliderModule,
        ReactiveFormsModule,
        PanelModule,
        InputTextModule,
        ButtonModule,
        MessagesModule,
        FloatLabelModule,
        DropdownModule,
        CalendarModule,
        AutoCompleteModule,
        DialogModule,
        ConfirmDialogModule,
        ToastModule,
        RadioButtonModule,
        MultiSelectModule,
        JoyrideModule,
        SliderModule,
        ListboxModule,
        TranslateModule
    ],
    templateUrl: './usage-add.component.html',
    styleUrl: './usage-add.component.scss',
    providers: [MessageService]
})
export class UsageAddComponent implements OnInit {
    private fb = inject(FormBuilder);
    usageForm = this.fb.group({
        substance: [0, Validators.min(1)],
        quantity: [0, Validators.min(1)],
        datetime: [new Date(), Validators.required],
        sentiment: [0, Validators.min(1)],
        craving: [1, Validators.required],
        trigger: [[], [Validators.required, Validators.minLength(1)]],
    });
    triggerForm = this.fb.group({
       name: [null, Validators.required] ,
    });
    showAddTriggerDialog = false;
    formSubmitted = false;
    
    substances: SubstanceDto[] = [];
    triggers: TriggerDto[] = [];
    filteredTriggers: TriggerDto[] = [];
    sentiments: {name: string, id: number}[] = [];

    showRespirationExerciseDialog = true;
    
    constructor(
        private substanceService: SubstanceService<SubstanceDto>,
        private triggerService: TriggerService<TriggerDto>,
        private triggerAddService: TriggerService<TriggerAddDto>,
        private usageService: UsageService<UsageDto>,
        private usageAddService: UsageService<UsageAddDto>,
        private messageService: MessageService,
        protected router: Router,
        private activatedRoute: ActivatedRoute,
        private translate: TranslateService
    ) {}
    
    ngOnInit(): void {
        const returning = this.activatedRoute.snapshot.queryParamMap.get('returning');
        if (returning) {
            this.showRespirationExerciseDialog = false;
        }
        this.substanceService.list().subscribe(substances => {
            if (!substances.length) {
                this.router.navigate(['/substance-add']);
                return;
            }
            this.substances = substances;
        });

        this.triggerService.list().subscribe(triggers => {
            this.triggers = triggers;
            this.filteredTriggers = triggers;
        });

        this.sentiments = [
            { id: 1, name: '😔'},
            { id: 2, name: '😟'},
            { id: 3, name: '😕'},
            { id: 4, name: '🙂‍'},
            { id: 5, name: '😃'},
        ];
    }
    
    async onSubmit() {
        this.formSubmitted = true;
        if (!this.usageForm.valid) {
            this.messageService.add({ 
                severity: 'error', 
                summary: await firstValueFrom(this.translate.get('Erro')), 
                detail: await firstValueFrom(this.translate.get("Verifique todos os valores do formulário")), 
                life: 3000,
            });
            return;
        }
        const form = this.usageForm.value;

        const usageData: UsageAddDto = {
            substance: form.substance || 0,
            quantity: form.quantity || 0,
            datetime: form.datetime || new Date(),
            sentiment: form.sentiment || 0,
            craving: form.craving || 0,
            trigger: form.trigger || null
        };

        this.usageAddService.add(usageData).subscribe(async result => {
            this.usageService.clearCache();
            this.messageService.add({ 
                severity: 'success',
                summary: await firstValueFrom(this.translate.get('Tudo certo')),
                detail: await firstValueFrom(this.translate.get("Dados de uso salvos com sucesso. Você já pode vê-los no dashboard. Abrindo...")),
                life: 2000,
            });
            setTimeout(() => this.router.navigate(['/usage-track']), 2000);
        });
    }
    
    triggerSearch(event: AutoCompleteCompleteEvent) {
        const filtered: any[] = [];
        const query = event.query;

        this.triggers.forEach((trigger) => {
            if (trigger.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                filtered.push(trigger);
            }
        });

        this.filteredTriggers = filtered;
    }

    showDialog() {
        this.showAddTriggerDialog = true;
    }

    async saveTrigger() {
        const data: TriggerAddDto = { name: this.triggerForm.value.name as unknown as string };

        const triggers = await firstValueFrom(this.triggerAddService.getByField('name', data.name));
        if (triggers.length) {
            this.messageService.add({ 
                severity: 'error', 
                summary: await firstValueFrom(this.translate.get('Entrada duplicada')), 
                detail: await firstValueFrom(this.translate.get('Já existe esse gatilho')), 
                life: 3000
            });
            return;
        }
        
        this.triggerAddService.add(data).subscribe({
            next: values => {
                this.triggerAddService.clearCache();
                this.triggers.push(values);
                this.filteredTriggers = this.triggers;
                
                this.showAddTriggerDialog = false
            },
            error: async error => {
                this.messageService.add({ 
                    severity: 'error', 
                    summary: await firstValueFrom(this.translate.get('Erro')), 
                    detail: await firstValueFrom(this.translate.get('Houve um erro ao salvar a substância!')), 
                    life: 2000
                });
            }
        });
    }

    increaseQuantity() {
        this.usageForm.patchValue({
            quantity: this.usageForm.value.quantity as number + 1
        });
    }

    decreaseQuantity() {
        const qtt = this.usageForm.value.quantity as number;
        let new_qtt = 0;
        if (qtt > 0) {
            new_qtt = qtt - 1;
        }
        this.usageForm.patchValue({
            quantity: new_qtt
        });
    }
}
