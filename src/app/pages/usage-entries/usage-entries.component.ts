import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { UsageService } from "../../services/usage.service";
import { UsageDto } from "../../dto/usage.dto";
import { TriggerService } from "../../services/trigger.service";
import { SubstanceService } from "../../services/substance.service";
import { TriggerDto } from "../../dto/trigger.dto";
import { CostService } from "../../services/cost.service";

interface UsageEntry {
    id: number;
    substance: string;
    datetime: string;
    quantity: string;
    sentiment: string;
    trigger: string[];
    cost?: number;
    craving: number;
}

@Component({
    selector: "app-usage-entries",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./usage-entries.component.html",
})
export class UsageEntriesComponent implements OnInit {
    Math = Math;

    usageHistory: UsageEntry[] = [];
    currentPage = 1;
    entriesPerPage = 10;
    substances: string[] = [];
    triggers: string[] = [];
    moods = [
        { emoji: "😢", label: "Sad" },
        { emoji: "😟", label: "Anxious" },
        { emoji: "😐", label: "Neutral" },
        { emoji: "🙂", label: "Good" },
        { emoji: "😄", label: "Great" },
    ];

    constructor(
        private usageService: UsageService,
        private triggerService: TriggerService,
        private substanceService: SubstanceService,
        private costService: CostService,
    ) { }

    ngOnInit() {
        this.triggers = [
            "Stress",
            "Social gathering",
            "Boredom",
            "Anxiety",
            "Celebration",
        ];
        
        this.usageService.list().then(async (data) => {
            const usageData = data as UsageDto[];
            const triggerData = this.triggerService.getDataAsMap(await this.triggerService.list(), 'name');
            const substanceData = this.substanceService.getDataAsMap(await this.substanceService.list(), 'name');
            
            this.usageHistory = usageData.map((entry) => ({
                id: entry.id,
                substance: substanceData.get(entry.substance)?.name || "Unknown",
                datetime: entry.datetime.toLocaleDateString(),
                quantity: entry.quantity.toString(),
                sentiment: entry.sentiment.toString(),
                trigger: entry.trigger ? entry.trigger.map(t => triggerData.get((t as TriggerDto).id)?.name || "Unknown") : [],
                craving: entry.craving,
                cost: entry.cost,
            })) as UsageEntry[];
            
        });
    }

    getCravingColor(intensity: number): string {
        if (intensity <= 3) return "#10B981";
        if (intensity <= 7) return "#F59E0B";
        return "#EF4444";
    }

    get currentEntries(): UsageEntry[] {
        const indexOfLastEntry = this.currentPage * this.entriesPerPage;
        const indexOfFirstEntry = indexOfLastEntry - this.entriesPerPage;
        return this.usageHistory.slice(indexOfFirstEntry, indexOfLastEntry);
    }

    get totalPages(): number {
        return Math.ceil(this.usageHistory.length / this.entriesPerPage);
    }

    async totalSpent() {
        return await this.costService.getTotalSpent();
    }

    get mostCommonTrigger() {
        const triggerCounts: { [key: string]: number } = {};
        this.usageHistory.forEach(entry => {
            entry.trigger.forEach(trigger => {
                triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
            });
        });
        const mostCommon = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0];
        return mostCommon ? mostCommon[0] : 'None';
    }

    getMoodEmoji(mood: string) {
        return this.moods.find(m => m.label === mood)?.emoji;
    }

    paginate(pageNumber: number) {
        this.currentPage = pageNumber;
    }
}
