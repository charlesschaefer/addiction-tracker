import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { Messages, MessagesModule } from 'primeng/messages';
import { Message, MessageService } from 'primeng/api';


import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { UsageService } from '../services/usage.service';
import { UsageAddDto, UsageDto } from '../dto/usage.dto';
import { TriggerService } from '../services/trigger.service';
import { TriggerAddDto, TriggerDto } from '../dto/trigger.dto';
import { firstValueFrom } from 'rxjs';

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
        ToastModule,
        RadioButtonModule,
        MultiSelectModule,
    ],
    templateUrl: './usage-add.component.html',
    styleUrl: './usage-add.component.scss',
    providers: [MessageService],
})
export class UsageAddComponent implements OnInit {
    private fb = inject(FormBuilder);
    usageForm = this.fb.group({
        substance: [0, Validators.required],
        quantity: [0, Validators.required],
        datetime: [new Date(), Validators.required],
        sentiment: [0, Validators.required],
        craving: [0, Validators.required],
        trigger: [[]],
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
    
    constructor(
        private substanceService: SubstanceService<SubstanceDto>,
        private triggerService: TriggerService<TriggerDto>,
        private triggerAddService: TriggerService<TriggerAddDto>,
        private usageService: UsageService<UsageDto>,
        private usageAddService: UsageService<UsageAddDto>,
        private messageService: MessageService,
        private router: Router,
    ) {}
    
    ngOnInit(): void {
        this.substanceService.list().subscribe(substances => {
            if (!substances.length) {
                this.router.navigate(['/substance-add']);
                return;
            }
            this.substances = substances;

            this.messageService.add({
                detail: "Um texto suficientemente grande para poder extender por um pedaço grande da tela.",
                summary: "Sucesso total",
                severity: 'success',
                life: 100000,
            });
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
    
    onSubmit(): void {
        this.formSubmitted = true;
        if (!this.usageForm.valid) {
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Erro', 
                detail: "Verifique todos os valores do formulário", 
                life: 3000,
            });
            return;
        }
        let form = this.usageForm.value;

        let usageData: UsageAddDto = {
            substance: form.substance || 0,
            quantity: form.quantity || 0,
            datetime: form.datetime || new Date(),
            sentiment: form.sentiment || 0,
            craving: form.craving || 0,
            trigger: form.trigger || null
        };

        this.usageAddService.add(usageData).subscribe(result => {
            this.usageService.clearCache();
            this.messageService.add({ 
                severity: 'success',
                summary: 'Tudo certo',
                detail: "Dados de uso salvos com sucesso. Você já pode vê-los no dashboard. Redirecionando...",
                life: 3000,
            });
            setTimeout(() => this.router.navigate(['/usage-track']), 3000);
        });
    }
    
    triggerSearch(event: AutoCompleteCompleteEvent) {
        let filtered: any[] = [];
        let query = event.query;

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
        let data: TriggerAddDto = { name: this.triggerForm.value.name as unknown as string };

        let triggers = await firstValueFrom(this.triggerAddService.getByField('name', data.name));
        if (triggers.length) {
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Entrada duplicada', 
                detail: 'Já existe esse gatilho', 
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
            error: error => {
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Erro', 
                    detail: 'Houve um erro ao salvar a substância!', 
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
}
