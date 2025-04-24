import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { UsageService } from "../../services/usage.service";
import { SubstanceService } from "../../services/substance.service";
import { UsageDto } from "../../dto/usage.dto";
import { SubstanceDto } from "../../dto/substance.dto";
import { TriggerDto } from "../../dto/trigger.dto";

@Component({
    selector: "app-triggers-page",
    standalone: true,
    imports: [CommonModule],
    templateUrl: "./triggers.component.html",
})
export class TriggersPageComponent implements OnInit {
    usageHistory: UsageDto[] = [];
    substances: SubstanceDto[] = [];
    selectedSubstance = "all";
    triggers: TriggerDto[] = [];
    COLORS = ["#8B5CF6", "#F97316", "#6366F1", "#FB923C", "#A855F7", "#FDBA74"];

    constructor(
        private usageService: UsageService,
        private substanceService: SubstanceService
    ) {}

    ngOnInit() {
        this.usageService.list().then((usages) => {
            this.usageHistory = usages as UsageDto[];
            // Collect all unique triggers from usageHistory
            this.triggers = Array.from(
                new Set(this.usageHistory.flatMap(u => (u.trigger || []) as TriggerDto[]))
            );
        });
        this.substanceService.list().then((subs) => {
            this.substances = subs as SubstanceDto[];
        });
    }

    getFilteredUsageHistory() {
        if (this.selectedSubstance === "all") return this.usageHistory;
        return this.usageHistory.filter(
            (entry) => entry.substance.toString() === this.selectedSubstance
        );
    }

    prepareTriggerData() {
        const triggerCounts: { [key: string]: number } = {};
        const filteredHistory = this.getFilteredUsageHistory();
        filteredHistory.forEach((entry) => {
            (entry.trigger || []).forEach((trigger) => {
                triggerCounts[trigger.name] = (triggerCounts[trigger.name] || 0) + 1;
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
            triggerBySubstance[substance.name] = {};
            this.triggers.forEach((trigger) => {
                triggerBySubstance[substance.name][trigger.name] = 0;
            });
        });
        this.usageHistory.forEach((entry) => {
            (entry.trigger || []).forEach((trigger) => {
                if (
                    triggerBySubstance[entry.substance] &&
                    triggerBySubstance[entry.substance][trigger.name] !== undefined
                ) {
                    triggerBySubstance[entry.substance][trigger.name]++;
                }
            });
        });
        return this.triggers.map((trigger) => {
            const data: any = { name: trigger };
            this.substances.forEach((substance) => {
                data[substance.name] = triggerBySubstance[substance.name][trigger.name] || 0;
            });
            return data;
        });
    }

    setSelectedSubstance(substance: string) {
        this.selectedSubstance = substance;
    }
}
