import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';
import { JoyrideModule, JoyrideService } from 'ngx-joyride';
import { CookieService } from 'ngx-cookie-service';
import {
    isPermissionGranted,
    requestPermission,
    sendNotification,
    type Options as NotificationOptions,
  } from "@tauri-apps/plugin-notification";

import { save } from "@tauri-apps/plugin-dialog";
import { BaseDirectory, exists, writeFile } from "@tauri-apps/plugin-fs";

import { ThemeService } from './services/theme.service';
import { BrowserModule } from '@angular/platform-browser';
    
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
    ],
    providers: [CookieService],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    title = 'Controle de Vícios';
    menuItems: MenuItem[] = [
        { 
            label: 'Consumo',
            items: [
                { label: "Home", routerLink: "/", icon: "pi pi-home" } as MenuItem,
                { label: "Acompanhar", routerLink: "/usage-track", icon: "pi pi-chart-line" } as MenuItem,
                { label: "Intervalos de Consumo", routerLink: "/usage-interval", icon: "pi pi-clock" } as MenuItem,
                { label: "Adicionar", routerLink: "/usage-add", icon: "pi pi-plus" } as MenuItem,
            ]
        },
        {
            separator: true
        },
        { 
            label: 'Recomendações',
            items: [
                { label: "Recomendações", routerLink: "/recommendations", icon: "pi pi-book" } as MenuItem,
            ]
        },
        {
            separator: true
        },
        {
            label: 'Gastos',
            items: [
                { label: "Acompanhar", routerLink: "/cost", icon: "pi pi-wallet" } as MenuItem,
                { label: "Adicionar", routerLink: "/cost-add", icon: "pi pi-money-bill" } as MenuItem,
            ]
        },
        {
            separator: true
        },
        {
            label: 'Configurações',
            items: [
                { label: "Adicionar Substância", routerLink: "/substance-add", icon: "pi pi-user-minus" } as MenuItem,
                { label: "Backup", routerLink: "/backup", icon: "pi pi-lock" } as MenuItem,
                { label: "Mudar tema", command: () => this.switchTheme(), icon: "pi pi-moon" } as MenuItem,
                {
                    separator: true
                },
                { label: "Sobre", routerLink: "/about", icon: "pi pi-info" } as MenuItem,
                
            ]
        },
    ];

    speedDialItems: MenuItem[] = [
        {
            icon: 'pi pi-wallet',
            routerLink: ['/cost']
        },
        {
            icon: 'pi pi-money-bill',
            routerLink: "/cost-add",
            title: "Adicionar gasto"
        },
        {
            icon: 'pi pi-home',
            routerLink: ['/']
        },
        {
            icon: 'pi pi-chart-line',
            routerLink: ['/usage-track']
        },
        {
            icon: 'pi pi-plus',
            routerLink: ['usage-add']
        },
    ];

    testPath: string;


    constructor(
        private themeService: ThemeService,
        private joyrideService: JoyrideService,
        private cookieService: CookieService,
    ) {}

    ngOnInit(): void {
        let currentTheme = this.themeService.getCurrentTheme();
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

        let currentTheme = this.themeService.getCurrentTheme();
        localStorage.setItem('theme', currentTheme);
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

