import { ApplicationConfig, DEFAULT_CURRENCY_CODE, importProvidersFrom, LOCALE_ID } from "@angular/core";
import { provideRouter } from "@angular/router";
import { registerLocaleData } from "@angular/common";
import localePt from "@angular/common/locales/pt";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
import { NgxIndexedDBModule } from "ngx-indexed-db";
import { JoyrideModule, JoyrideService } from 'ngx-joyride';

import { routes } from "./app.routes";
import { dbConfig } from "./db.config";

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideAnimationsAsync(),
    provideLuxonDateAdapter(),
    importProvidersFrom(JoyrideModule.forRoot()),
    importProvidersFrom(NgxIndexedDBModule.forRoot(dbConfig)),
    /* {
      provide: LOCALE_ID,
      useValue: 'pt-BR',
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'pt-BR',
    }, */
    {
      provide: LOCALE_ID,
      useValue: 'pt-BR'
    },
    {
      provide: DEFAULT_CURRENCY_CODE,
      useValue: 'BRL'
    }
  ],
};
