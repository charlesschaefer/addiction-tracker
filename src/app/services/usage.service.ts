import { Injectable } from '@angular/core';
import { ServiceAbstract } from './service.abstract';

@Injectable({
    providedIn: 'root'
})
export class UsageService<T> extends ServiceAbstract<T> {
    storeName = 'usage';
}
