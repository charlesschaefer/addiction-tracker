import { Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    currentTheme: string = 'light';
    
    switchTheme(theme?: string) {
        let themeLink = window.document.getElementById('app-theme') as HTMLLinkElement;

        if (theme) {
            themeLink.href = `aura-${theme}.css`;
            this.currentTheme = theme;
            return;
        }
        
        if (themeLink) {
            if (themeLink.href.match('aura-dark.css')) {
                themeLink.href = 'aura-light.css';
                this.currentTheme = 'light';
            } else {
                themeLink.href = 'aura-dark.css';
                this.currentTheme = 'dark';
            }
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}
