import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    currentTheme = 'light';

    constructor() {
        // On service init, set theme from localStorage or system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            this.setDarkMode(true);
        } else {
            this.setDarkMode(false);
        }
    }

    switchTheme() {
        this.setDarkMode(this.currentTheme !== 'dark');
    }

    setDarkMode(isDark: boolean) {
        const html = document.documentElement;
        if (isDark) {
            html.classList.add('dark');
            this.currentTheme = 'dark';
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.remove('dark');
            this.currentTheme = 'light';
            localStorage.setItem('theme', 'light');
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}
