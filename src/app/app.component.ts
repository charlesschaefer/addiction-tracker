import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
    
    
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
export class AppComponent implements OnInit {
    items: MenuItem[] = [
        { label: "Home", routerLink: "/", icon: "pi pi-home" } as MenuItem,
        { label: "Novo Registro", routerLink: "/usage-add", icon: "pi pi-plus" } as MenuItem,
        { label: "Acompanhar Registros", routerLink: "/usage-track", icon: "pi pi-wave-pulse" } as MenuItem,
        { label: "Adicionar Substância", routerLink: "/substance-add", icon: "pi pi-user-minus" } as MenuItem,
    ]
    ngOnInit(): void {
        
    }
}
