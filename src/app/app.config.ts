import { ApplicationConfig, importProvidersFrom, LOCALE_ID } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
import { NgxIndexedDBModule } from "ngx-indexed-db";

import { routes } from "./app.routes";
import { dbConfig } from "./db.config";
import { MAT_DATE_LOCALE } from "@angular/material/core";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideAnimationsAsync(),
    provideLuxonDateAdapter(),
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
    }
  ],
};
