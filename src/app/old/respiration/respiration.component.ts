import { Component, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'app-respiration',
    standalone: true,
    imports: [
        DialogModule,
        ButtonModule,
        TranslocoModule
    ],
    templateUrl: './respiration.component.html',
    styleUrl: './respiration.component.scss'
})
export class RespirationComponent {
    protected router = inject(Router);


    playState = 'paused';
    showLink = true;
    showRedirectDialog = false;

    startAnimation(event: Event) {
        this.playState = 'running';
        this.showLink = false;
    }
    
    showConfirmationDialog() {
        console.log("Entrou")
        this.showRedirectDialog = true;
    }
}
