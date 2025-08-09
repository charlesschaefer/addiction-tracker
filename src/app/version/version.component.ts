import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslocoModule } from '@jsverse/transloco';

/// eslint-disable-next-line import/extensions
import packageJson from '../../../package.json';
import { isMobile } from '../util/functions';


@Component({
    selector: 'app-version',
    standalone: true,
    imports: [
        ButtonModule,
        RouterLink,
        ConfirmDialogModule,
        TranslocoModule
    ],
    providers: [
        ConfirmationService, 
        MessageService
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './version.component.html',
    styles: `
        a, button { text-decoration: none; font-size: 0.8em} 
        * {text-align: center;}
    `
})
export class VersionComponent implements OnInit {
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    version = '';

    constructor() {
        this.version = packageJson.version
    }

    ngOnInit(): void {
        if (isMobile()) {
            return;
        }
    }
}
