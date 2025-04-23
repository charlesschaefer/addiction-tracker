import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SubstanceService } from "../services/substance.service";
import { SubstanceAddDto, SubstanceDto } from "../dto/substance.dto";
import { MotivationalFactorDto } from "../dto/motivational-factor.dto";


/**
 * Angular component for recording substance use.
 * Handles all logic for the record substance use popup.
 */
@Component({
    selector: "app-record-substance-use",
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: "./record-substance-use.component.html",
})
export class RecordSubstanceUseComponent implements OnInit {
    /** List of available substances. */
    @Input() substances?: SubstanceDto[] | null = [];
    /** Currently selected substance name. */
    @Input() selectedSubstance?: string;
    /** Whether to show the motivational prompt. */
    @Input() showMotivationalPrompt = false;
    /** The current motivational factor to display. */
    @Input() currentMotivationalFactor: MotivationalFactorDto | null = null;
    /** Whether to show the breathing prompt. */
    @Input() showBreathingPrompt = false;

    /** Emits when the form is submitted. */
    @Output() submit = new EventEmitter<any>();
    /** Emits when the popup should be closed. */
    @Output() close = new EventEmitter<void>();
    /** Emits when a new substance is added. */
    @Output() addSubstance = new EventEmitter<SubstanceDto>();
    /** Emits when a new motivational factor is added. */
    @Output() addMotivationalFactor = new EventEmitter<
        Omit<MotivationalFactorDto, "id" | "createdAt">
    >();

    /** Date of usage. */
    date: string = "";
    /** Time of usage. */
    time: string = "";
    /** Amount used. */
    amount: string = "";
    /** Mood selected. */
    mood: string = "";
    /** List of available triggers. */
    triggers: string[] = [];
    /** List of selected triggers. */
    selectedTriggers: string[] = [];
    /** New trigger input value. */
    newTrigger: string = "";
    /** Whether to show the add trigger input. */
    showAddTrigger: boolean = false;
    /** Cost input value. */
    cost: string = "";
    /** Whether to show the cost input. */
    showCostInput: boolean = false;
    /** Craving intensity value. */
    cravingIntensity: number = 5;
    /** New substance input value. */
    newSubstance: string = "";
    /** Whether to show the add substance form. */
    showAddSubstance: boolean = false;
    /** Step in the substance creation process. */
    substanceCreationStep: "name" | "motivation" = "name";
    /** ID of the new substance being created. */
    newSubstanceId?: number;
    /** Whether a motivational factor is being added. */
    addingMotivationalFactor: boolean = false;

    /** List of moods for selection. */
    moods = [
        { emoji: "😢", label: "Sad" },
        { emoji: "😟", label: "Anxious" },
        { emoji: "😐", label: "Neutral" },
        { emoji: "🙂", label: "Good" },
        { emoji: "😄", label: "Great" },
    ];

    constructor(private substanceService: SubstanceService) {}

    /**
     * Initializes the component and sets default values.
     */
    ngOnInit(): void {
        const now = new Date();
        this.date = now.toISOString().split("T")[0];
        this.time = now.toTimeString().split(" ")[0].substring(0, 5);
        this.triggers = [
            "Stress",
            "Social gathering",
            "Boredom",
            "Anxiety",
            "Celebration",
        ];

        console.log("Substances:", this.substances);
        if (this.substances && this.substances.length > 0) {
            this.selectedSubstance = this.substances[0].name;
            this.showMotivationalPrompt = false;
            this.showBreathingPrompt = false;
            this.showAddSubstance = false;
            return;
        }
        this.showAddSubstance = true;

        console.log("Substances:", this.substances);
    }

    /**
     * Returns a random motivational factor for the selected substance.
     * @returns MotivationalFactorDto or null
     */
    getRandomMotivationalFactor(): MotivationalFactorDto | null {
        return null; // Placeholder
    }

    /**
     * Handles adding a new substance.
     */
    async handleAddSubstance() {
        const name = this.newSubstance.trim();
        if (name) {
            const substanceObj = {
                name,
            } as Partial<SubstanceDto>;
            try {
                const substanceId = await this.substanceService.add(
                    substanceObj as SubstanceAddDto
                );
                substanceObj.id = substanceId;
                console.log("Substance added:", substanceObj);
            } catch (error) {
                console.error("Error adding substance:", error);
                return;
            }

            this.addSubstance.emit(substanceObj as SubstanceDto);
            this.showAddSubstance = false;
            this.newSubstanceId = substanceObj.id;
            this.selectedSubstance = substanceObj.name;
            this.substanceCreationStep = "motivation";
        }
    }

    clearSubstanceForm() {
        this.newSubstance = "";
        this.newSubstanceId = undefined;
    }

    /**
     * Finishes the substance creation process.
     */
    handleFinishSubstanceCreation(): void {
        this.showAddSubstance = false;
        this.substanceCreationStep = "name";
        this.newSubstance = "";
        this.newSubstanceId = undefined;
    }

    /**
     * Handles adding a new trigger to the list.
     */
    handleAddTrigger(): void {
        if (
            this.newTrigger.trim() &&
            !this.triggers.includes(this.newTrigger.trim())
        ) {
            this.triggers = [...this.triggers, this.newTrigger.trim()];
            this.selectedTriggers = [
                ...this.selectedTriggers,
                this.newTrigger.trim(),
            ];
            this.newTrigger = "";
            this.showAddTrigger = false;
        }
    }

    /**
     * Toggles a trigger in the selected triggers list.
     * @param trigger The trigger to toggle.
     */
    toggleTrigger(trigger: string): void {
        if (this.selectedTriggers.includes(trigger)) {
            this.selectedTriggers = this.selectedTriggers.filter(
                (t) => t !== trigger
            );
        } else {
            this.selectedTriggers = [...this.selectedTriggers, trigger];
        }
    }

    /**
     * Handles form submission and emits the usage data.
     * @param event The form submit event.
     */
    onSubmit(event: Event): void {
        event.preventDefault();
        if (
            this.selectedSubstance &&
            this.date &&
            this.time &&
            this.amount &&
            this.mood
        ) {
            const newUsage = {
                id: Date.now(),
                substance: this.selectedSubstance,
                date: this.date,
                time: this.time,
                amount: this.amount,
                mood: this.mood,
                triggers: [...this.selectedTriggers],
                cost: this.cost ? parseFloat(this.cost) : 0,
                cravingIntensity: parseInt(this.cravingIntensity.toString()),
            };
            this.submit.emit(newUsage);

            // Reset form
            this.selectedSubstance = "";
            this.amount = "";
            this.mood = "";
            this.selectedTriggers = [];
            this.cost = "";
            this.cravingIntensity = 5;
            this.showCostInput = false;
        }
    }

    /**
     * Returns a color string based on craving intensity.
     * @param intensity The craving intensity value.
     * @returns The color hex string.
     */
    getCravingColor(intensity: number): string {
        const numIntensity = parseInt(intensity.toString());
        if (numIntensity <= 3) return "#10B981"; // Green for mild
        if (numIntensity <= 7) return "#F59E0B"; // Amber for moderate
        return "#EF4444"; // Red for severe
    }

    handleSelectSubstance(substance: string): void {
        this.selectedSubstance = substance;       
        this.showMotivationalPrompt = false;
    }
}
