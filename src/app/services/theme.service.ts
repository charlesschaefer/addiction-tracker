import { Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  switchTheme() {
    let themeLink = window.document.getElementById('app-theme') as HTMLLinkElement;

    if (themeLink) {
      if (themeLink.href.match('aura-dark.css')) {
        themeLink.href = 'aura-light.css';
      } else {
        themeLink.href = 'aura-dark.css';
      }
    }
  }
}
