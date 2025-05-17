import { ApplicationConfig, DEFAULT_CURRENCY_CODE, importProvidersFrom, LOCALE_ID, isDevMode } from "@angular/core";
import { provideRouter } from "@angular/router";
import { registerLocaleData } from "@angular/common";
import localePt from "@angular/common/locales/pt";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
import { JoyrideModule } from 'ngx-joyride';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { TranslocoModule, provideTransloco } from '@jsverse/transloco';
import { providePrimeNG } from 'primeng/config';
import { AppTheme } from './app.theme';
import { AppDb } from "./app.db";
import { TranslocoHttpLoader } from './transloco-loader';

import { routes } from "./app.routes";
//import { dbConfig } from "./db.config";
import { DbService } from "./services/db.service";

registerLocaleData(localePt);

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
        availableLangs: ['en', 'pt-br', 'es'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: {
          allowEmpty: true,
          logMissingKey: true,
          useFallbackTranslation: false
        }
      },
      loader: TranslocoHttpLoader
    }),
    {
      provide: LOCALE_ID,
      useValue: 'pt-BR'
    },
    {
      provide: DEFAULT_CURRENCY_CODE,
      useValue: 'BRL'
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
