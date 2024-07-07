import { Injectable } from '@angular/core';
import { ServiceAbstract } from './service.abstract';

@Injectable({
    providedIn: 'root'
})
export class TriggerService<T> extends ServiceAbstract<T> {
    storeName: 'trigger';
    
}
