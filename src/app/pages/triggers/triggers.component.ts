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
    selector: "app-triggers-page",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./triggers.component.html",
})
export class TriggersPageComponent implements OnInit {
    usageHistory: UsageEntry[] = [];
    substances: string[] = [];
    selectedSubstance = "all";
    triggers: string[] = [];
    COLORS = ["#8B5CF6", "#F97316", "#6366F1", "#FB923C", "#A855F7", "#FDBA74"];

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

    getFilteredUsageHistory(): UsageEntry[] {
        if (this.selectedSubstance === "all") return this.usageHistory;
        return this.usageHistory.filter(
            (entry) => entry.substance === this.selectedSubstance
        );
    }

    prepareTriggerData() {
        const triggerCounts: { [key: string]: number } = {};
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            entry.triggers.forEach((trigger) => {
                triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
            });
        });
        return Object.keys(triggerCounts).map((trigger) => ({
            name: trigger,
            value: triggerCounts[trigger],
        }));
    }

    prepareTriggerBySubstanceData() {
        const triggerBySubstance: any = {};
        this.substances.forEach((substance) => {
            triggerBySubstance[substance] = {};
            this.triggers.forEach((trigger) => {
                triggerBySubstance[substance][trigger] = 0;
            });
        });
        this.usageHistory.forEach((entry) => {
            entry.triggers.forEach((trigger) => {
                if (
                    triggerBySubstance[entry.substance] &&
                    triggerBySubstance[entry.substance][trigger] !== undefined
                ) {
                    triggerBySubstance[entry.substance][trigger]++;
                }
            });
        });
        return this.triggers.map((trigger) => {
            const data: any = { name: trigger };
            this.substances.forEach((substance) => {
                data[substance] = triggerBySubstance[substance][trigger] || 0;
            });
            return data;
        });
    }

    setSelectedSubstance(substance: string) {
        this.selectedSubstance = substance;
    }
}
