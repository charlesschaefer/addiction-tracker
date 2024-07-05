import { DBConfig, NgxIndexedDBModule } from "ngx-indexed-db";

export const dbConfig: DBConfig = {
    name: 'usage-control',
    version: 1,
    objectStoresMeta: [
        {
            store: 'substance',
            storeConfig: { keyPath: 'id', autoIncrement: true},
            storeSchema: [
                { name: 'name', keypath: 'name', options: { unique: false }}
            ]
        },
        {
            store: 'usage',
            storeConfig: { keyPath: 'id', autoIncrement: true },
            storeSchema: [
                { name: 'substance', keypath: 'substance', options: { unique: false }},
                { name: 'quantity', keypath: 'quantity', options: { unique: false }},
                { name: 'datetime', keypath: 'datetime', options: { unique: false }},
                { name: 'sentiment', keypath: 'sentiment', options: { unique: false }},
            ]
        }
    ]
};