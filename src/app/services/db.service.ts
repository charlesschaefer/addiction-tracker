import { Injectable } from '@angular/core';
import { Table } from 'dexie';

import { AppDb } from "../app.db";

/**
 * Service for accessing database tables.
 */
@Injectable({
    providedIn: 'root'
})
export class DbService {

    /** Instance of the application database. */
    dbService: AppDb = new AppDb();

    /**
     * Returns a Dexie table by name.
     * @param name Table name
     */
    getTable(name: string) {
        const table = name as keyof AppDb;
        const entity = this.dbService[table];
        return entity as Table<any, any, any>;
    }

}
