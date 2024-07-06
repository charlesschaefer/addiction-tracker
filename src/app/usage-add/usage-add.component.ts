import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { DateTime } from 'luxon';

import { SubstanceService } from '../services/substance.service';
import { SubstanceAddDto, SubstanceDto } from '../dto/substance.dto';
import { UsageService } from '../services/usage.service';
import { UsageAddDto } from '../dto/usage.dto';
import { Router } from '@angular/router';

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
    });
    
    substances: SubstanceDto[] = [];
    
    constructor(
        private substanceService: SubstanceService<SubstanceDto>,
        private substanceAddService: SubstanceService<SubstanceAddDto>,
        private usageAddService: UsageService<UsageAddDto>,
        private snackBar: MatSnackBar,
        private router: Router,
    ) {}
    
    ngOnInit(): void {
        this.substanceService.list().subscribe(substances => {
            this.substances = substances;
        });
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
        };

        this.usageAddService.add(usageData).subscribe(result => {
            this.snackBar.open("Dados de uso salvos com sucesso. Você já pode vê-lo no dashboard", "Fechar");
            setTimeout(() => this.router.navigate(['/']), 1000);
        });
    }
    
    formatSliderLabel(value: number): string {
        let ret = "";
        switch (value) {
            case 1:
            ret = ':-(';
            break;
            case 5: 
            ret = ":-|";
            break;
            case 10:
            ret = ":-D";
            break;
            default:
            ret = value as unknown as string;
        }
        return ret;
    }
}
