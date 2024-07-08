import { Injectable } from '@angular/core';
import { ServiceAbstract } from './service.abstract';

@Injectable({
    providedIn: 'root'
})
export class CostService<T> extends ServiceAbstract<T> {
    storeName = 'cost';
}
