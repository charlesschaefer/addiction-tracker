import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "app-record-substance-use",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./record-substance-use.component.html",
})
export class RecordSubstanceUseComponent {
    @Input() substances: any[] = [];
    @Input() selectedSubstance: string = "";
    @Input() showMotivationalPrompt = false;
    @Input() currentMotivationalFactor: any = null;
    @Input() showBreathingPrompt = false;
    @Output() submit = new EventEmitter<any>();
    @Output() close = new EventEmitter<void>();
    @Output() addSubstance = new EventEmitter<any>();
    @Output() addMotivationalFactor = new EventEmitter<any>();
    // ...add other @Input/@Output as needed

    // Add all the state and methods as in the React version, adapted for Angular
}
