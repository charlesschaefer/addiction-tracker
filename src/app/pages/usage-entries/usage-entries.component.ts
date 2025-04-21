import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

interface UsageEntry {
    id: number;
    substance: string;
    date: string;
    time: string;
    amount: string;
    mood: string;
    triggers: string[];
    cost: number;
    cravingIntensity: number;
}

@Component({
    selector: "app-usage-entries-page",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./usage-entries.component.html",
})
export class UsageEntriesComponent implements OnInit {
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

    ngOnInit() {
        this.triggers = [
            "Stress",
            "Social gathering",
            "Boredom",
            "Anxiety",
            "Celebration",
        ];
        if (this.usageHistory.length === 0) {
            this.usageHistory = this.generateSampleData();
        }
    }

    generateSampleData(): UsageEntry[] {
        const substances = ["Alcohol", "Cigarettes", "Cannabis"];
        this.substances = substances;
        const moods = ["Sad", "Anxious", "Neutral", "Good", "Great"];
        const sampleTriggers = [
            "Stress",
            "Social gathering",
            "Boredom",
            "Anxiety",
            "Celebration",
        ];
        const today = new Date();
        const sampleData: UsageEntry[] = [];
        for (let i = 30; i >= 0; i--) {
            if (i % 3 === 0 && i > 5) continue;
            const entryDate = new Date(today);
            entryDate.setDate(today.getDate() - i);
            const substance =
                substances[Math.floor(Math.random() * substances.length)];
            const entryMood = moods[Math.floor(Math.random() * moods.length)];
            const cravingLevel = Math.floor(Math.random() * 10) + 1;
            const entryTriggers: string[] = [];
            const numTriggers = Math.floor(Math.random() * 2) + 1;
            for (let j = 0; j < numTriggers; j++) {
                const trigger =
                    sampleTriggers[
                        Math.floor(Math.random() * sampleTriggers.length)
                    ];
                if (!entryTriggers.includes(trigger))
                    entryTriggers.push(trigger);
            }
            let cost = 0;
            if (substance === "Alcohol")
                cost = Math.floor(Math.random() * 30) + 5;
            else if (substance === "Cigarettes")
                cost = Math.floor(Math.random() * 10) + 8;
            else if (substance === "Cannabis")
                cost = Math.floor(Math.random() * 40) + 20;
            sampleData.push({
                id: Date.now() - i * 1000000,
                substance,
                date: entryDate.toISOString().split("T")[0],
                time: `${String(Math.floor(Math.random() * 24)).padStart(
                    2,
                    "0"
                )}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
                amount:
                    substance === "Alcohol"
                        ? `${Math.floor(Math.random() * 3) + 1} drinks`
                        : substance === "Cigarettes"
                        ? `${Math.floor(Math.random() * 5) + 1} cigarettes`
                        : `${Math.floor(Math.random() * 2) + 1} uses`,
                mood: entryMood,
                triggers: entryTriggers,
                cost: cost,
                cravingIntensity: cravingLevel,
            });
        }
        return sampleData;
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

    paginate(pageNumber: number) {
        this.currentPage = pageNumber;
    }
}
