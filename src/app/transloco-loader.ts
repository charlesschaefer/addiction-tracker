import { HttpClient } from '@angular/common/http';
import { TranslocoLoader } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslocoHttpLoader implements TranslocoLoader {
    private http = inject(HttpClient);


    getTranslation(lang: string): Observable<any> {
        lang = lang.toLowerCase();
        return this.http.get(`/assets/i18n/${lang}.json`);
    }
} 
