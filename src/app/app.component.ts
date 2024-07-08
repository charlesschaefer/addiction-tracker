import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import {
    isPermissionGranted,
    requestPermission,
    sendNotification,
    type Options as NotificationOptions,
  } from "@tauri-apps/plugin-notification";
    
    
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
        ButtonModule
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
    items: MenuItem[] = [
        { label: "Home", routerLink: "/", icon: "pi pi-home" } as MenuItem,
        { label: "Novo Registro", routerLink: "/usage-add", icon: "pi pi-plus" } as MenuItem,
        { label: "Acompanhar Registros", routerLink: "/usage-track", icon: "pi pi-wave-pulse" } as MenuItem,
        { label: "Adicionar Substância", routerLink: "/substance-add", icon: "pi pi-user-minus" } as MenuItem,
    ];

    ngAfterViewInit() {
        
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
}
