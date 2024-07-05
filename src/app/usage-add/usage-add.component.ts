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
    sentiment: [0, Validators.required],
  });

  substances: SubstanceDto[] = [];

  constructor(
    private substanceService: SubstanceService<SubstanceDto>,
    private substanceAddService: SubstanceService<SubstanceAddDto>,
    private snackBar: MatSnackBar
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
