import { ApplicationConfig, DEFAULT_CURRENCY_CODE, importProvidersFrom, LOCALE_ID, isDevMode } from "@angular/core";
import { provideRouter } from "@angular/router";
import { registerLocaleData } from "@angular/common";
import localePt from "@angular/common/locales/pt";
import localeEn from "@angular/common/locales/en";
import localeEs from "@angular/common/locales/es";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
import { JoyrideModule } from 'ngx-joyride';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslocoModule, provideTransloco } from '@jsverse/transloco';
import { providePrimeNG } from 'primeng/config';
import { AppTheme } from './app.theme';
import { AppDb } from "./app.db";
import { TranslocoHttpLoader } from './transloco-loader';
import { getCurrency } from 'locale-currency';

import { routes } from "./app.routes";
//import { dbConfig } from "./db.config";
import { DbService } from "./services/db.service";

registerLocaleData(localePt);
registerLocaleData(localeEn);
registerLocaleData(localeEs);

export type TranslocoAvailableLangs = 'en' | 'pt-br' | 'es';
export const AVAILABLE_LANGS = ['en', 'pt-br', 'es'] as TranslocoAvailableLangs[];
export const AVAILABLE_LANGS_LABELS = {'en': 'English', 'pt-br': 'Portuguese', 'es': 'Spanish'};

export type AvailableLocale = 'en-US' | 'pt-BR' | 'es-ES';
export const AVAILABLE_LOCALES = ['en-US', 'pt-BR', 'es-ES'] as AvailableLocale[];


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideAnimationsAsync(),
    provideHttpClient(),
    provideLuxonDateAdapter(),
    importProvidersFrom(JoyrideModule.forRoot()),
    importProvidersFrom(TranslocoModule),
    provideTransloco({
      config: { 
        availableLangs: AVAILABLE_LANGS,
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: {
          allowEmpty: true,
          logMissingKey: true
        }
      },
      loader: TranslocoHttpLoader
    }),
    {
      provide: LOCALE_ID,
      useValue: getLocaleLanguage() //'pt-BR'
    },
    {
      provide: DEFAULT_CURRENCY_CODE,
      useValue: getCurrency(navigator.language || 'en')//getLocale()) //'BRL'
    },
    providePrimeNG({
      ripple: true,
      theme: {
        preset: AppTheme,
        options: {
          darkModeSelector: '.dark-mode'
        }
      }
    }),
    {
      provide: 'AppDb',
      useClass: AppDb
    },
    {
        provide: 'DbService',
        useClass: DbService
    },
    {
      provide: TranslocoHttpLoader,
      useFactory: (http: HttpClient) => new TranslocoHttpLoader(http),
      deps: [HttpClient]
    }
  ],
};

function getLocaleLanguage(): TranslocoAvailableLangs {
    let lang = (navigator.language.toLowerCase() || 'en') as TranslocoAvailableLangs;
    if (!AVAILABLE_LANGS.includes(lang)) {
       lang = AVAILABLE_LANGS[0];
    }
    return lang;
}
