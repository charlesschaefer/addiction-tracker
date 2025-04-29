import { HttpClient } from '@angular/common/http';
import { TranslocoLoader } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslocoHttpLoader implements TranslocoLoader {
    constructor(private http: HttpClient) {}

    getTranslation(lang: string): Observable<any> {
        return this.http.get(`/assets/i18n/${lang}.json`);
    }
} 
