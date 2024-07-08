import { Injectable } from "@angular/core";
import { NgxIndexedDBService } from "ngx-indexed-db";
import { BehaviorSubject, Observable, catchError, map, throwError } from "rxjs";

@Injectable({ providedIn: 'root' })
export abstract class ServiceAbstract<T> {
    private cache: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);
    private useCache: boolean = true;
    abstract storeName: string;

    constructor(
        protected dbService: NgxIndexedDBService
    ) {}

    /**
     * Gets a cached list of accounts
     * 
     * @returns Observable<BaseDto[]>
     */
    list(): Observable<T[]> {
        // TODO: it is fetching from cache, but not storing in it
        if (this.useCache && this.cache.getValue().length) {
            return new Observable<T[]>((observer) => {
                observer.next(this.cache.getValue());
            });
        }
        let cached = this.dbService.getAll<T>(this.storeName);
        cached.subscribe(value => this.cache  = new BehaviorSubject<T[]>(value));
        return cached;
    }

    add(data: T) {
        return this.dbService.add(this.storeName, data);
    }

    edit(data: T): Observable<T> {
        return this.dbService.update(this.storeName, data)
            .pipe(
                map((response: T) => response),
                catchError((error: T) => throwError(error))
            );
    }

    get(id: number): Observable<T> {
        return this.dbService.getByID<T>(this.storeName, id);
    }

    getByField(field: string, value: any) {
        return this.dbService.getAllByIndex(this.storeName, field, IDBKeyRange.only(value));
    }

    remove(id: number): Observable<any> {
        return this.dbService.deleteByKey(this.storeName, id);
    }

    deactivateCache(): void {
        this.useCache = false;
    }

    clearCache(): void {
        this.cache = new BehaviorSubject<T[]>([]);
    }
}