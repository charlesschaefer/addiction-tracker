import { Injectable } from '@angular/core';

/**
 * Service for managing application theme (light/dark mode).
 */
@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    /** Current theme ("light" or "dark"). */
    currentTheme = 'light';

    /**
     * Initializes theme from localStorage or system preference.
     */
    constructor() {
        // On service init, set theme from localStorage or system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            this.setDarkMode(true);
        } else {
            this.setDarkMode(false);
        }
    }

    /**
     * Switches between light and dark themes.
     */
    switchTheme() {
        this.setDarkMode(this.currentTheme !== 'dark');
    }

    /**
     * Sets dark mode on or off.
     * @param isDark Whether to enable dark mode
     */
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

    /**
     * Gets the current theme.
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
}
