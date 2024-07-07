import { Injectable } from '@angular/core';
import { ServiceAbstract } from './service.abstract';

@Injectable({
    providedIn: 'root'
})
export class SubstanceService<T> extends ServiceAbstract<T> {
    storeName = "substance";
    
}
