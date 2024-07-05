import { Injectable } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { SubstanceDto } from '../dto/substance.dto';

@Injectable({
  providedIn: 'root'
})
export class SubstanceService<T> extends ServiceAbstract<T> {
  storeName = "substance";
  
}
