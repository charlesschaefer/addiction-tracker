import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { JoyrideModule, JoyrideService } from 'ngx-joyride';
import { CookieService } from 'ngx-cookie-service';
import {
    isPermissionGranted,
    requestPermission,
    sendNotification,
  } from "@tauri-apps/plugin-notification";

import { ThemeService } from './services/theme.service';
import { invoke } from '@tauri-apps/api/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
    
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        MatMenuModule,
        MatIconModule,
        RouterLink,
        ToolbarModule,
        MenuModule,
        ButtonModule,
        SpeedDialModule,
        JoyrideModule,
        TieredMenuModule,
        MenuModule,
        TranslateModule
    ],
    providers: [CookieService, RouterLink],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    title = 'Controle de Vícios';
    menuItems!: MenuItem[];

    speedDialItems: MenuItem[] = [
        {
            icon: 'pi pi-wallet',
            command: () => this.router.navigate(['/cost']),
        },
        {
            icon: 'pi pi-money-bill',
            command: () => this.router.navigate(["/cost-add"]),
            title: "Adicionar gasto"
        },
        {
            icon: 'pi pi-home',
            command: () => this.router.navigate(['/']),
        },
        {
            icon: 'pi pi-chart-line',
            command: () => this.router.navigate(['/usage-track']),
        },
        {
            icon: 'pi pi-plus',
            command: () => this.router.navigate(['/usage-add']),
        },
    ];

    testPath: string;


    constructor(
        private themeService: ThemeService,
        private joyrideService: JoyrideService,
        private cookieService: CookieService,
        private translate: TranslateService,
        private router: Router
    ) {
        translate.setDefaultLang('en');
        //translate.use('en');


        let userLanguage = localStorage.getItem('language');
        if (!userLanguage) {
            userLanguage = 'en';
        }
        this.translate.use(userLanguage);
    }

    ngOnInit(): void {
        let window = globalThis.window as Window & { __TAURI_INTERNALS__?: { invoke: (command: string) => void } };
        if (window?.__TAURI_INTERNALS__?.invoke) {
            invoke("set_frontend_complete");
        }
        
        this.setupMenu();

        const currentTheme = this.themeService.getCurrentTheme();
        let userTheme = localStorage.getItem('theme');
        if (!userTheme) {
            userTheme = currentTheme;
        }
        if (userTheme != currentTheme) {
            console.log(userTheme, currentTheme);
            this.themeService.switchTheme(userTheme);
        }

        const sawGuidedTour = this.cookieService.get('sawGuidedTour');
        if (!sawGuidedTour) {
            this.initializeGuidedTour();
        }
    }

    // An example of how to add notifications from tauri javascript code
    async notify() {
        // Do you have permission to send a notification?
        let permissionGranted = await isPermissionGranted();
        // If not we need to request it
        if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === 'granted';
        }
        console.log("permission", permissionGranted);
        // Once permission has been granted we can send the notification
        if (permissionGranted) {
            sendNotification("Tauri is awesome");
            sendNotification({ title: 'Addiction Tracker', body: 'Olá usuário, este é um exemplo de notificação' });
        }
    }

    switchTheme() {
        this.themeService.switchTheme();

        const currentTheme = this.themeService.getCurrentTheme();
        localStorage.setItem('theme', currentTheme);
    }

    switchLanguage(language: 'en' | 'pt-BR') {
        console.log("Changing language to ", language)
        this.translate.use(language);
        localStorage.setItem('language', language);
        this.setupMenu();
    }

    async setupMenu() {
        this.menuItems = [
            { label: await firstValueFrom(this.translate.get("Home")), routerLink: "/", icon: "pi pi-home" } as MenuItem,
            { 
                label: 'Consumo',
                items: [
                    { label: await firstValueFrom(this.translate.get("Acompanhar")), routerLink: "/usage-track", icon: "pi pi-chart-line" } as MenuItem,
                    { label: await firstValueFrom(this.translate.get("Intervalos de Consumo")), routerLink: "/usage-interval", icon: "pi pi-clock" } as MenuItem,
                    { label: await firstValueFrom(this.translate.get("Adicionar")), routerLink: "/usage-add", icon: "pi pi-plus" } as MenuItem,
                ]
            },
            {
                separator: true
            },
            { 
                label: await firstValueFrom(this.translate.get('Recomendações')),
                items: [
                    { label: await firstValueFrom(this.translate.get("Recomendações")), routerLink: "/recommendations", icon: "pi pi-book" } as MenuItem,
                ]
            },
            // {
            //     separator: true
            // },
            // {
            //     label: await firstValueFrom(this.translate.get('Gastos')),
            //     items: [
            //         { label: await firstValueFrom(this.translate.get("Acompanhar")), routerLink: "/cost", icon: "pi pi-wallet" } as MenuItem,
            //         { label: await firstValueFrom(this.translate.get("Adicionar")), routerLink: "/cost-add", icon: "pi pi-money-bill" } as MenuItem,
            //     ]
            // },
            // {
            //     separator: true
            // },
            // {
            //     label: await firstValueFrom(this.translate.get('Configurações')),
            //     items: [
            //         { label: await firstValueFrom(this.translate.get("Adicionar Substância")), routerLink: "/substance-add", icon: "pi pi-user-minus" } as MenuItem,
            //         { label: await firstValueFrom(this.translate.get("Backup")), routerLink: "/backup", icon: "pi pi-lock" } as MenuItem,
            //         { label: await firstValueFrom(this.translate.get("Sincronizar dispositivos")), routerLink: "/sync", icon: "pi pi-sync" } as MenuItem,
            //         { label: await firstValueFrom(this.translate.get("Mudar tema")), command: () => this.switchTheme(), icon: "pi pi-moon" } as MenuItem,
            //     ]
            // },
            // { 
            //     label: await firstValueFrom(this.translate.get("Idioma")), 
            //     items: [
            //         { label: await firstValueFrom(this.translate.get("Português")), command: () => this.switchLanguage('pt-BR') },
            //         { label: await firstValueFrom(this.translate.get("Inglês")), command: () => this.switchLanguage('en') },
            //     ]
            // },
            // {
            //     separator: true
            // },
            // { label: await firstValueFrom(this.translate.get("Sobre")), routerLink: "/about", icon: "pi pi-info" } as MenuItem,
        ];
    }

    initializeGuidedTour() {
        this.joyrideService.startTour({
            steps: [
                'firstStep', 
                'substanceAdd@substance-add', 
                'dialMenu',  
                'usageAdd@usage-add', 
                "triggerAdd@usage-add",
                "usageTrack@usage-track", 
                "costAdd@cost-add",
                "recommendations@recommendations",
                "substanceAddStart@substance-add",
            ]
        }).subscribe({
            complete: () => {
                // save in cookies that the user saw the guided tour
                this.cookieService.set('sawGuidedTour', '1');
            }
        });
    }
}

