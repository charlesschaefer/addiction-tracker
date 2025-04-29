import { CommonModule } from "@angular/common";
import { Component, computed, OnInit, signal, untracked } from "@angular/core";
import { UsageService } from "../../services/usage.service";
import { UsageDto } from "../../dto/usage.dto";
import { TriggerService } from "../../services/trigger.service";
import { SubstanceService } from "../../services/substance.service";
import { TriggerDto } from "../../dto/trigger.dto";
import { CostService } from "../../services/cost.service";
import { SentimentService } from "../../services/sentiment.service";
import { SubstanceDto } from "../../dto/substance.dto";
import { DateTime, DateTimeFormatOptions } from "luxon";
import { FormsModule } from "@angular/forms";
import { SelectModule } from "primeng/select";

@Component({
    selector: "app-usage-entries",
    standalone: true,
    imports: [CommonModule, FormsModule, SelectModule],
    templateUrl: "./usage-entries.component.html",
})
export class UsageEntriesComponent implements OnInit {
    console = console;
    DateTime = DateTime;
    dateFormat = {
        dateStyle: "short",
    } as DateTimeFormatOptions;
    Math = Math;
    Array = Array;

    currentPage = signal<number>(1);
    entriesPerPage = 10;
    substances: Map<number, SubstanceDto> = new Map();
    moods = SentimentService.sentiments;

    currentSubstance = signal<number>(0);
    usageEntries = signal<UsageDto[]>([]);
    usageHistory = computed<UsageDto[]>(() => {
        const substance = this.currentSubstance();
        if (substance > 0) {
            const usageEntries = this.usageEntries();
            const entries = usageEntries.filter(usageEntry => usageEntry.substance == substance);
            
            if (entries.length) {
                return entries;
            }
            return [] as unknown as UsageDto[];
        }
        return this.usageEntries();
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
        const triggerCounts: { [key: string]: number } = {};
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

    constructor(
        private usageService: UsageService,
        private triggerService: TriggerService,
        private substanceService: SubstanceService,
        private costService: CostService
    ) {}

    ngOnInit() {
        this.substanceService
            .list()
            .then(
                (substances) =>
                    (this.substances = this.substanceService.getDataAsMap(
                        substances,
                        "id"
                    ) as Map<number, SubstanceDto>)
            );
        this.usageService.list().then(async (data) => {
            this.usageEntries.set(data as UsageDto[]);
        });

        // this.costService
        //     .getTotalSpent()
        //     .then((totalSpent) => (this.totalSpent.set(totalSpent));
    }

    getCravingColor(intensity: number): string {
        if (intensity <= 3) return "#10B981";
        if (intensity <= 7) return "#F59E0B";
        return "#EF4444";
    }

    getMoodEmoji(mood: number) {
        return this.moods[mood]?.emoji;
    }

    paginate(pageNumber: number) {
        this.currentPage.set(pageNumber);
    }

    parseInt(value: string) {
        return parseInt(value);
    }
}
