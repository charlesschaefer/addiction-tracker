import { CommonModule } from "@angular/common";
import { Component, computed, OnInit, signal, inject } from "@angular/core";
import { UsageService } from "../../services/usage.service";
import { UsageDto } from "../../dto/usage.dto";
import { SubstanceService } from "../../services/substance.service";
import { SentimentService } from "../../services/sentiment.service";
import { SubstanceDto } from "../../dto/substance.dto";
import { DateTime, DateTimeFormatOptions } from "luxon";
import { FormsModule } from "@angular/forms";
import { SelectModule } from "primeng/select";
import { MessageService } from "primeng/api";
import { TranslocoModule } from "@jsverse/transloco";
import { SubstanceSelectorComponent } from "../../components/substance/substance-selector.component";

@Component({
    selector: "app-usage-entries",
    standalone: true,
    imports: [CommonModule, FormsModule, SelectModule, TranslocoModule, SubstanceSelectorComponent],
    templateUrl: "./usage-entries.component.html",
})
export class UsageEntriesComponent implements OnInit {
    private usageService = inject(UsageService);
    private substanceService = inject(SubstanceService);
    private messageService = inject(MessageService);

    console = console;
    DateTime = DateTime;
    dateFormat = {
        dateStyle: "medium",
        timeStyle: 'short',
    } as DateTimeFormatOptions;
    Math = Math;
    Array = Array;

    currentPage = signal<number>(1);
    entriesPerPage = 10;
    substances = new Map<number, SubstanceDto>();
    moods = SentimentService.sentiments;

    currentSubstance = signal<number>(0);
    usageEntries = signal<UsageDto[]>([]);
    usageHistory = computed<UsageDto[]>(() => {
        const substance = this.currentSubstance();
        const usageEntries = this.usageEntries();
        
        if (substance > 0) {
            // Filter by specific substance
            const entries = usageEntries.filter(usageEntry => usageEntry.substance == substance);
            return entries.length ? entries : [];
        } else {
            // Filter to only show entries for active substances when "All Substances" is selected
            const activeSubstanceIds = Array.from(this.substances.keys());
            const filteredEntries = usageEntries.filter(usageEntry => 
                activeSubstanceIds.includes(usageEntry.substance)
            );
            return filteredEntries;
        }
    });

    currentEntries = computed<UsageDto[]>(() => {
        console.warn("Lá vou eu de novo currentEntries");
        
        const substance = this.currentSubstance();
        console.log("Current substance: ", substance);

        const history = this.usageHistory();
        
        let totalItems;
        if ((totalItems = history.length)) {
            let indexOfLastEntry = this.currentPage() * this.entriesPerPage;
            const indexOfFirstEntry = indexOfLastEntry - this.entriesPerPage;

            if (totalItems < indexOfLastEntry) {
                indexOfLastEntry = totalItems;
            }
            this.console.log("indexOfLastEntry", indexOfLastEntry, "indexOfFirstEntry", indexOfFirstEntry)
            return history.slice(
                indexOfFirstEntry,
                indexOfLastEntry
            );
        }
        return [];
    });

    mostCommonTrigger = computed<string>(() => {
        console.warn("Lá vou eu de novo trigger");
        const triggerCounts: Record<string, number> = {};
        this.usageHistory().forEach((entry) => {
            if (entry && entry.trigger) {
                entry.trigger?.forEach((trigger) => {
                    triggerCounts[trigger.name] =
                        (triggerCounts[trigger.name] || 0) + 1;
                });
            }
        });
        const mostCommon = Object.entries(triggerCounts).sort(
            (a, b) => b[1] - a[1]
        )[0];
        console.log("Most common:", mostCommon?.length ? mostCommon[0] : "No triggers recorded");
        return mostCommon?.length ? mostCommon[0] : "No triggers recorded";
    });

    totalPages = computed<number>(() => {
        return Math.ceil(this.usageHistory().length / this.entriesPerPage);
    });

    pageNumerator = computed<[]>(() => [].constructor(this.totalPages()));

    totalSpent = computed<number>(() => {
        const entries = this.usageHistory();
        return entries.reduce((prev, entry) => prev += entry?.cost !== undefined ? entry.cost : 0, 0);
    });

    entryToDelete?: number;
    showDeleteConfirmation = signal(false);

    ngOnInit() {
        this.substanceService
            .getActiveSubstances()
            .then(
                (substances) =>
                    (this.substances = this.substanceService.getDataAsMap(
                        substances,
                        "id"
                    ) as Map<number, SubstanceDto>)
            );
        this.loadUsageEntries();

        // this.costService
        //     .getTotalSpent()
        //     .then((totalSpent) => (this.totalSpent.set(totalSpent));
    }

    loadUsageEntries() {
        this.usageService.listActive().then(async (data) => {
            // sort by date, from newest to oldest
            data.sort((a, b) => {
                const dateA = DateTime.fromJSDate(a.datetime);
                const dateB = DateTime.fromJSDate(b.datetime);
                return dateB.toMillis() - dateA.toMillis();
            });
            this.usageEntries.set(data as UsageDto[]);
        });
    }

    getCravingColor(intensity: number): string {
        if (intensity <= 3) return "#10B981";
        if (intensity <= 7) return "#F59E0B";
        return "#EF4444";
    }

    getMoodEmoji(mood: number) {
        return this.moods[mood]?.emoji;
    }

    showDeleteConfirmationDialog(id: number) {
        this.showDeleteConfirmation.set(true);
        this.entryToDelete = id;
    }

    delete(id: number) {
        this.entryToDelete = undefined;
        this.showDeleteConfirmation.set(false);
        this.usageService.remove(id).then(() => {
            this.messageService.add({
                life: 3000,
                severity: 'success',
                summary: 'Usage removed',
                detail: 'Usage successfully removed'
            });
            this.loadUsageEntries();
        })
    }

    paginate(pageNumber: number) {
        this.currentPage.set(pageNumber);
    }

    parseInt(value: string) {
        return parseInt(value);
    }
}
