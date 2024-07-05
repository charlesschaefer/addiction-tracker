import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet,
  RouterLink } from '@angular/router';
import { invoke } from "@tauri-apps/api/core";
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

}
