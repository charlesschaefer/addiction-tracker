import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

@Component({
    selector: "app-lock-button",
    imports: [CommonModule],
    templateUrl: "./lock-button.component.html",
})
export class LockButtonComponent {
    showMenu = false;
    showTooltip = false;

    logout() {
        throw new Error("Method not implemented.");
    }
}
