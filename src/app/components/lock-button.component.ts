import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
    selector: "app-lock-button",
    imports: [CommonModule, TranslocoModule],
    templateUrl: "./lock-button.component.html",
})
export class LockButtonComponent {
    showMenu = false;
    showTooltip = false;

    logout() {
        throw new Error("Method not implemented.");
    }
}
