import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { DateTime } from 'luxon';
import { PanelModule } from 'primeng/panel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';

import { SubstanceService } from '../services/substance.service';
import { SubstanceDto } from '../dto/substance.dto';
import { UsageService } from '../services/usage.service';
import { UsageAddDto } from '../dto/usage.dto';
import { Message } from 'primeng/api';
import { TriggerService } from '../services/trigger.service';
import { TriggerAddDto, TriggerDto } from '../dto/trigger.dto';

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
    ],
    templateUrl: './usage-add.component.html',
    styleUrl: './usage-add.component.scss'
})
export class UsageAddComponent implements OnInit {
    private fb = inject(FormBuilder);
    usageForm = this.fb.group({
        substance: [null, Validators.required],
        quantity: [null, Validators.required],
        datetime: [DateTime.fromJSDate(new Date()), Validators.required],
        sentiment: [null, Validators.required],
        craving: [null, Validators.required],
        trigger: [[], Validators.required],
    });
    triggerForm = this.fb.group({
       name: [null, Validators.required] ,
    });
    errorMessage: Message[] = [{severity: "error", detail: "Verifique todos os campos"}];
    showAddTriggerDialog = false;
    
    substances: SubstanceDto[] = [];
    triggers: TriggerDto[] = [];
    filteredTriggers: TriggerDto[] = [];
    sentiments: {name: string, id: number}[] = [];
    
    constructor(
        private substanceService: SubstanceService<SubstanceDto>,
        private triggerService: TriggerService<TriggerDto>,
        private triggerAddService: TriggerService<TriggerAddDto>,
        private usageAddService: UsageService<UsageAddDto>,
        private snackBar: MatSnackBar,
        private router: Router,
    ) {}
    
    ngOnInit(): void {
        this.substanceService.list().subscribe(substances => {
            this.substances = substances;
        });

        this.triggerService.list().subscribe(triggers => {
            this.triggers = triggers;
            this.filteredTriggers = triggers;
        });

        this.sentiments = [
            { id: 1, name: ':('},
            { id: 2, name: ':\\'},
            { id: 3, name: ':|'},
            { id: 4, name: ':)'},
            { id: 5, name: ':D'},
        ]
    }
    
    onSubmit(): void {
        if (!this.usageForm.valid) {
            this.snackBar.open("Verifique os erros do formulário", "Fechar");
            return;
        }
        let form = this.usageForm.value;
        let dateStr = form.datetime as unknown as string;
        ;
        let usageData: UsageAddDto = {
            substance: form.substance || 0,
            quantity: form.quantity || 0,
            datetime: DateTime.fromFormat(dateStr.split("T").join(" "), "yyyy-MM-dd HH:mm").toJSDate(),
            sentiment: form.sentiment || 0,
            craving: form.craving || 0,
            trigger: form.trigger || ['']
        };

        this.usageAddService.add(usageData).subscribe(result => {
            this.snackBar.open("Dados de uso salvos com sucesso. Você já pode vê-lo no dashboard", "Fechar");
            setTimeout(() => this.router.navigate(['/']), 1000);
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
    }

    showDialog() {
        this.showAddTriggerDialog = true;
    }

    saveTrigger(): boolean {
        let data: TriggerAddDto = { name: this.triggerForm.value.name as unknown as string };
        

        return this.triggerAddService.add(data) as unknown as boolean;
    }
}
