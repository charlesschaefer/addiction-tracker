import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "app-add-record-button",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./add-record-button.component.html",
})
export class AddRecordButtonComponent {
    @Input() tailwindClasses: { gradients: { primary: string } } = {
        gradients: { primary: "" },
    };
    @Input() focusStyles: { highContrast: string } = { highContrast: "" };
    @Output() clickAdd = new EventEmitter<void>();

    onClick() {
        this.clickAdd.emit();
    }
}
