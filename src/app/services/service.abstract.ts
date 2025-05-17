import { Inject, Injectable } from "@angular/core";
import { Table } from "dexie";
import { DatabaseChangeType } from "dexie-observable/api";
import { BehaviorSubject, Observable, from } from "rxjs";
import { AppDb, TableKeys } from "../app.db";
import { Changes, DataUpdatedService } from "./data-updated.service";
import { DbService } from "./db.service";

/**
 * Abstract base class for CRUD services.
 * @template T Entity type
 */
@Injectable({ providedIn: 'root' })
export abstract class ServiceAbstract<T> {
    /** Cache for entities. */
    private cache: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);
    private useCache = true;
    protected abstract storeName: TableKeys;
    protected table!: Table<T, any, any>;
    protected abstract dbService: DbService;

    @Inject(DataUpdatedService) protected dataUpdatedService?: DataUpdatedService;

    constructor() {}

    /**
     * Sets the Dexie table for this service.
     */
    setTable() {
        this.table = this.dbService.getTable(this.storeName) as Table<T>;
    }

    /**
     * Lists all entities.
     */
    list() {
        return this.table.toArray();
    }

    /**
     * Adds an entity and notifies data update service.
     * @param data Entity to add
     */
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

    /**
     * Bulk adds entities.
     * @param data Array of entities
     */
    bulkAdd(data: T[]) {
        const promise = this.table.bulkAdd(data);
        return promise;
    }

    /**
     * Updates an entity by id.
     * @param id Entity id
     * @param data Updated entity
     */
    edit(id: number, data: T) {
        const promise = this.table.update(id, data as any);
        return promise;
    }

    /**
     * Gets an entity by id.
     * @param id Entity id
     */
    get(id: number) {
        const promise = this.table.get(id);
        return promise;
    }

    /**
     * Gets entities by a field value.
     * @param field Field name
     * @param value Field value
     */
    getByField(field: string, value: any) {
        const where: Record<string, any> = {};
        where[field] = value;
        return this.table.where(where).toArray();
    }

    /**
     * Removes an entity by id.
     * @param id Entity id
     */
    remove(id: number) {
        const promise = this.table.delete(id);
        return promise;
    }

    /**
     * Clears all entities from the table.
     */
    clear() {
        const promise = this.table.clear();
        return promise;
    }

    /**
     * Disables the cache.
     */
    deactivateCache() {
        this.useCache = false;
    }

    /**
     * Clears the cache.
     */
    clearCache() {
        this.cache = new BehaviorSubject<T[]>([]);
    }

    /**
     * Converts an array of objects into a map using a specified field as the key.
     * @param data Array of objects
     * @param field Field to use as key
     */
    getDataAsMap(data: T[], field: any): Map<number, T> {
        if (!data && !data[field]) {
            throw new Error(`Data is empty or field ${field} does not exist`);
        }
        const map = new Map<number, T>()
        return data.reduce((acc, item) => {
            const element = item as any;
            const key = element[field] as unknown as number;
            acc.set(key, element);
            return acc;
        }, map);
    }
}
