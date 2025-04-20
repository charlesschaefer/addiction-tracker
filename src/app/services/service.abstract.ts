import { Inject, Injectable } from "@angular/core";
import { Table } from "dexie";
import { DatabaseChangeType } from "dexie-observable/api";
import { BehaviorSubject, Observable, from } from "rxjs";
import { AppDb, TableKeys } from "../app.db";
import { Changes, DataUpdatedService } from "./data-updated.service";
import { DbService } from "./db.service";

@Injectable({ providedIn: 'root' })
export abstract class ServiceAbstract<T> {
    private cache: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);
    private useCache = true;
    protected abstract storeName: TableKeys;
    protected table!: Table<T, any, any>;
    protected abstract dbService: DbService;

    @Inject(DataUpdatedService) protected dataUpdatedService?: DataUpdatedService;

    constructor() {}

    setTable() {
        this.table = this.dbService.getTable(this.storeName) as Table<T>;
    }

    list() {
        return this.table.toArray();
    }

    add(data: T) {
        const promise = this.table.add(data);
        promise.then(() => this.dataUpdatedService?.next([{
            type: DatabaseChangeType.Create,
            table: this.storeName,
            key: 'id',
            obj: data
        } as Changes]))
        return promise;
    }

    bulkAdd(data: T[]) {
        const promise = this.table.bulkAdd(data);
        return promise;
    }

    edit(id: number, data: T) {
        const promise = this.table.update(id, data as any);
        return promise;
    }

    get(id: number) {
        const promise = this.table.get(id);
        return promise;
    }

    getByField(field: string, value: any) {
        const where: Record<string, any> = {};
        where[field] = value;
        return this.table.where(where).toArray();
    }

    remove(id: number) {
        const promise = this.table.delete(id);
        return promise;
    }

    clear() {
        const promise = this.table.clear();
        return promise;
    }

    deactivateCache() {
        this.useCache = false;
    }

    clearCache() {
        this.cache = new BehaviorSubject<T[]>([]);
    }
}
