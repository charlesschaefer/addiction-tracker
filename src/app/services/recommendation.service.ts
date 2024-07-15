import { Injectable } from '@angular/core';
import { ServiceAbstract } from './service.abstract';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService<T> extends ServiceAbstract<T> {
  storeName = 'recommendation';
}
