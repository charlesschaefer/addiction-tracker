import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-respiration',
    standalone: true,
    imports: [
        DialogModule,
        ButtonModule,
        TranslateModule,
    ],
    templateUrl: './respiration.component.html',
    styleUrl: './respiration.component.scss'
})
export class RespirationComponent {

    playState = 'paused';
    showLink = true;
    showRedirectDialog = false;

    constructor(
        protected router: Router,
    ) {}

    startAnimation(event: Event) {
        this.playState = 'running';
        this.showLink = false;
    }
    
    showConfirmationDialog() {
        console.log("Entrou")
        this.showRedirectDialog = true;
    }
}
