interface PageEvent {
    first?: number;
    rows?: number;
    page?: number;
    pageCount?: number;
}

export interface SubstanceGroupedItem<T> {
    name: string;
    substanceId: number;
    items: T[];
}


export abstract class PaginatedComponent<T> {
    public firstItem: number[] = [];
    public rowsToShow: number[] = [];
    public totalRecords: number[] = [];

    allItems: SubstanceGroupedItem<T>[] = [];
    paginatedItems: SubstanceGroupedItem<T>[] = [];

    initializePagination() {
        this.allItems.forEach(items => {
            this.firstItem[items.substanceId] = 0;
            this.rowsToShow[items.substanceId] = 5;
            this.totalRecords[items.substanceId] = items.items.length;
        })
    }

    changePage(event: PageEvent, substanceId: number) {
        this.firstItem[substanceId] = event.first as unknown as number;
        this.rowsToShow[substanceId] = event.rows as unknown as number;

        this.generatePaginatedItems();
    }

    generatePaginatedItems() {
        let paginatedItems: SubstanceGroupedItem<T>[] = [];
        
        this.allItems.forEach((substanceItem, idx) => {
            let firstItem = this.firstItem[substanceItem.substanceId] as unknown as number;
            let rowsToShow = this.rowsToShow[substanceItem.substanceId] as unknown as number;
            paginatedItems[idx] = {
                name: substanceItem.name,
                substanceId: substanceItem.substanceId,
                items: substanceItem.items.slice(
                    firstItem,
                    firstItem + rowsToShow
                )
            };
            this.totalRecords[substanceItem.substanceId] = substanceItem.items.length;
        });
        this.paginatedItems = paginatedItems;
    }
}
