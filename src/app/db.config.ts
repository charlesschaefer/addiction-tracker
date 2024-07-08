import { DBConfig, NgxIndexedDBModule } from "ngx-indexed-db";

export const dbConfig: DBConfig = {
    name: 'usage-control',
    version: 3,
    objectStoresMeta: [
        {
            store: 'substance',
            storeConfig: { keyPath: 'id', autoIncrement: true},
            storeSchema: [
                { name: 'name', keypath: 'name', options: { unique: true }}
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
                { name: 'craving', keypath: 'craving', options: { unique: false }},
                { name: 'trigger', keypath: 'trigger', options: { unique: false }}
            ]
        },
        {
            store: 'trigger',
            storeConfig: { keyPath: 'id', autoIncrement: true },
            storeSchema: [
                { name: 'name', keypath: 'name', options: { unique: true }}
            ]
        },
        {
            store: 'cost',
            storeConfig: { keyPath: 'id', autoIncrement: true },
            storeSchema: [
                { name: 'substance', keypath: 'substance', options: { unique: false }},
                { name: 'value', keypath: 'value', options: { unique: false }},
                { name: 'date', keypath: 'date', options: { unique: false }}
            ]
        }
    ]
};