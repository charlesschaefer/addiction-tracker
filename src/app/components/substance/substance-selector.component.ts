import { Component, input, model } from '@angular/core';
import { SubstanceDto } from '../../dto/substance.dto';
import { TranslocoModule } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    selector: 'app-substance-selector',
    imports: [
        TranslocoModule,
        FormsModule,
        CommonModule,
        DatePickerModule,
    ],
    templateUrl: './substance-selector.component.html'
})
export class SubstanceSelectorComponent {

    
    currentSubstance = model<number>();

    substances = input<MapIterator<SubstanceDto>>();
    showIntervalSelector = input<boolean>(false);
    dateRange = model<Date[]|null>(null);


}
