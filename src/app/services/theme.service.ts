import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    currentTheme = 'light';
    
    switchTheme(theme?: string) {
        const themeLink = window.document.getElementById('app-theme') as HTMLLinkElement;

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
