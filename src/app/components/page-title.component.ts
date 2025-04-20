import { Component, Input } from "@angular/core";

@Component({
    selector: "app-page-title",
    standalone: true,
    templateUrl: "./page-title.component.html",
})
export class PageTitleComponent {
    @Input() title!: string;
    @Input() description?: string;
}
