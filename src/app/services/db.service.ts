import { Injectable } from '@angular/core';
import { Table } from 'dexie';

import { AppDb } from "../app.db";

@Injectable({
    providedIn: 'root'
})
export class DbService {

    dbService: AppDb = new AppDb();

    getTable(name: string) {
        const table = name as keyof AppDb;
        const entity = this.dbService[table];
        return entity as Table<any, any, any>;
    }

}
