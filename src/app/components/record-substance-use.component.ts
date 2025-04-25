import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SubstanceService } from "../services/substance.service";
import { SubstanceAddDto, SubstanceDto, SubstanceIcon } from "../dto/substance.dto";
import { MotivationalFactorDto } from "../dto/motivational-factor.dto";
import { UsageService } from "../services/usage.service";
import { MotivationalFactorService } from "../services/motivational-factor.service";
import { SentimentService } from "../services/sentiment.service";
import { SelectModule } from "primeng/select";
import { SubstanceIconSelectComponent } from "./substance-icon-select/substance-icon-select.component";
import { TriggerAddDto, TriggerDto } from "../dto/trigger.dto";
import { TriggerService } from "../services/trigger.service";

/**
 * Angular component for recording substance use.
 * Handles all logic for the record substance use popup.
 */
@Component({
    selector: "app-record-substance-use",
    standalone: true,
    imports: [CommonModule, FormsModule, SelectModule, SubstanceIconSelectComponent],
    templateUrl: "./record-substance-use.component.html",
})
export class RecordSubstanceUseComponent implements OnInit {
    /** List of available substances. */
    @Input() substances?: SubstanceDto[] | null = [];
    /** Currently selected substance name. */
    @Input() selectedSubstance?: SubstanceDto;
    /** The current motivational factor to display. */
    @Input() currentMotivationalFactor: MotivationalFactorDto | null = null;

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
    triggers: TriggerDto[] = [];
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
    /** Selected substance icon */
    newSubstanceIcon?: string = "tretinha cabolosa";
    /** Whether a motivational factor is being added. */
    addingMotivationalFactor: boolean = false;
    /** Selected Sentiment */
    sentiment: string = "";

    /** List of sentiments for selection. */
    sentiments = SentimentService.sentiments;
    /** List of motivational factors for the selected substance. */
    motivationalFactors: MotivationalFactorDto[] = [];

    constructor(
        private substanceService: SubstanceService,
        private usageService: UsageService,
        private motivationalFactorService: MotivationalFactorService,
        private triggerService: TriggerService
    ) {}

    ngOnInit(): void {
        if (!this.substances?.length) {
            this.substanceService.list().then((subs) => {
                this.substances = subs as SubstanceDto[];
                if (this.substances && this.substances.length > 0) {
                    this.showAddSubstance = false;
                } else {
                    this.showAddSubstance = true;
                }
            });
        } else {
            this.showAddSubstance = false;
        }

        const now = new Date();
        this.date = now.toISOString().split("T")[0];
        this.time = now.toTimeString().split(" ")[0].substring(0, 5);
        
        this.triggerService.list().then((triggers) => {
            this.triggers = triggers as TriggerDto[];
            console.log("Triggers:", this.triggers);
        });

        

        if (!this.currentMotivationalFactor) {
            console.log("Não tem motivational factor");
            this.motivationalFactorService.list().then((factors) => {
                console.log("Buscando motivational factors", factors);
                this.motivationalFactors = factors as MotivationalFactorDto[];
                this.selectRandomMotivationalFactor();
                console.log("Motivational Factors:", this.motivationalFactors);
            })
        }
    }

    /**
     * Returns a random motivational factor for the selected substance.
     * @returns MotivationalFactorDto or null
     */
    selectRandomMotivationalFactor() {
        if (!this.motivationalFactors) return null;

        // Fetch motivational factors for this substance
        const randIdx = Math.floor(Math.random() * this.motivationalFactors.length);
        console.warn("Vamos pegar o idx: ", randIdx);

        this.currentMotivationalFactor = this.motivationalFactors[randIdx];
        return this.currentMotivationalFactor;
    }

    /**
     * Handles adding a new substance.
     */
    async handleAddSubstance() {
        const name = this.newSubstance.trim();
        const icon = SubstanceIcon[this.newSubstanceIcon?.trim() as keyof typeof SubstanceIcon] ?? undefined;
        if (name) {
            const substanceObj = {
                name,
                icon
            } as Partial<SubstanceDto>;
            this.substanceService
                .add(substanceObj as SubstanceAddDto)
                .then(async (substanceId) => {
                    substanceObj.id = substanceId;
                    this.addSubstance.emit(substanceObj as SubstanceDto);
                    this.showAddSubstance = false;
                    this.newSubstanceId = substanceObj.id;
                    this.selectedSubstance = await this.substanceService.get(substanceObj.id || 0) as SubstanceDto;
                    this.substanceCreationStep = "motivation";

                    this.addSubstance.emit(substanceObj as SubstanceDto);
                })
                .catch((error) => {
                    console.error("Error adding substance:", error);
                });
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
            !this.triggers.find(trigger => trigger.name == this.newTrigger.trim())
        ) {
            const newTriggerObj = {
                name: this.newTrigger.trim(),
            };
            this.triggerService.add(newTriggerObj).then((id) => {
                const newTrigger = {...newTriggerObj, id};
                this.triggers.push(newTrigger);
                this.selectedTriggers = [
                    ...this.selectedTriggers,
                    newTriggerObj.name,
                ];
            });
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
            this.usageService.add(newUsage as any).then(() => {
                this.submit.emit(newUsage);

                // Reset form
                this.selectedSubstance = undefined;
                this.amount = "";
                this.mood = "";
                this.selectedTriggers = [];
                this.cost = "";
                this.cravingIntensity = 5;
                this.showCostInput = false;
            });
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

    handleSelectSubstance(substance: SubstanceDto): void {
        this.selectedSubstance = substance;

        this.motivationalFactorService.getSubstanceFactors(substance.id).then((factors) => {
            this.motivationalFactors = factors as MotivationalFactorDto[];
            if (this.motivationalFactors.length > 0) {
                const randomIdx = Math.floor(Math.random() * this.motivationalFactors.length);
                this.currentMotivationalFactor = this.motivationalFactors[randomIdx];
            } else {
                this.currentMotivationalFactor = null;
            }
        })
    }

    increaseAmount() {
        if (this.amount) {
            this.amount = (parseFloat(this.amount) + 1).toString();
        } else {
            this.amount = "1";
        }
    }

    decreaseAmount() {
        if (this.amount) {
            const newAmount = parseFloat(this.amount) - 1;
            this.amount = newAmount > 0 ? newAmount.toString() : "0";
        } else {
            this.amount = "0";
        }
    }
}
