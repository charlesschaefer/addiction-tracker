import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SubstanceService } from "../services/substance.service";
import {
    SubstanceAddDto,
    SubstanceDto,
    SubstanceIcon,
} from "../dto/substance.dto";
import { MotivationalFactorDto } from "../dto/motivational-factor.dto";
import { UsageService } from "../services/usage.service";
import { MotivationalFactorService } from "../services/motivational-factor.service";
import { SentimentService } from "../services/sentiment.service";
import { SelectModule } from "primeng/select";
import { SubstanceIconSelectComponent } from "./substance-icon-select/substance-icon-select.component";
import { TriggerAddDto, TriggerDto } from "../dto/trigger.dto";
import { TriggerService } from "../services/trigger.service";
import { DatePickerModule } from "primeng/datepicker";
import { UsageAddDto } from "../dto/usage.dto";
import { CostService } from "../services/cost.service";
import { CostAddDto } from "../dto/cost.dto";
import { MessageService } from "primeng/api";
import { UsageFillingService } from "../services/usage-filling.service";
import { UsageFillingAddDto } from "../dto/usage-filling.dto";

/**
 * Angular component for recording substance use.
 * Handles all logic for the record substance use popup.
 */
@Component({
    selector: "app-record-substance-use",
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        SelectModule,
        SubstanceIconSelectComponent,
        DatePickerModule,
    ],
    templateUrl: "./record-substance-use.component.html",
})
export class RecordSubstanceUseComponent implements OnInit {
    /** List of available substances. */
    @Input() substances?: SubstanceDto[] | null = [];
    /** Currently selected substance name. */
    @Input() selectedSubstance?: SubstanceDto;
    /** The current motivational factor to display. */
    @Input() currentMotivationalFactor: MotivationalFactorDto | null = null;
    /** List of alternative activities. */
    @Input() alternatives: any[] = [];
    /** The alternative activity that was selected by the user */
    @Input() selectedAlternativeActivity?: {id: number, name: string};

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
    /** Emits when a substance is selected (to show alternatives). */
    @Output() showAlternatives = new EventEmitter<void>();
    /** Emits when an alternative activity is selected. */
    @Output() selectAlternative = new EventEmitter<{id: number, name: string}>();
    /** Emits when feedback is provided for an alternative activity. */
    @Output() alternativeFeedback = new EventEmitter<{
        activity: any;
        wasSuccessful: boolean;
        feedback?: string;
    }>();

    /** Date of usage. */
    datetime: Date = new Date();
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

    /** Reference to the Math object for use in the template. */
    Math = Math;

    constructor(
        private substanceService: SubstanceService,
        private usageService: UsageService,
        private motivationalFactorService: MotivationalFactorService,
        private triggerService: TriggerService,
        private costService: CostService,
        private messageService: MessageService,
        private usageFillingService: UsageFillingService
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
        this.datetime = now;

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
            });
        }
    }

    /**
     * Returns a random motivational factor for the selected substance.
     * @returns MotivationalFactorDto or null
     */
    selectRandomMotivationalFactor() {
        if (!this.motivationalFactors) return null;

        // Fetch motivational factors for this substance
        const randIdx = Math.floor(
            Math.random() * this.motivationalFactors.length
        );
        console.warn("Vamos pegar o idx: ", randIdx);

        this.currentMotivationalFactor = this.motivationalFactors[randIdx];
        return this.currentMotivationalFactor;
    }

    /**
     * Handles adding a new substance.
     */
    async handleAddSubstance() {
        const name = this.newSubstance.trim();
        const icon =
            SubstanceIcon[
                this.newSubstanceIcon?.trim() as keyof typeof SubstanceIcon
            ] ?? undefined;
        if (name) {
            const substanceObj = {
                name,
                icon,
            } as Partial<SubstanceDto>;
            this.substanceService
                .add(substanceObj as SubstanceAddDto)
                .then(async (substanceId) => {
                    substanceObj.id = substanceId;
                    this.addSubstance.emit(substanceObj as SubstanceDto);
                    this.showAddSubstance = false;
                    this.newSubstanceId = substanceObj.id;
                    this.selectedSubstance = (await this.substanceService.get(
                        substanceObj.id || 0
                    )) as SubstanceDto;
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
            !this.triggers.find(
                (trigger) => trigger.name == this.newTrigger.trim()
            )
        ) {
            const newTriggerObj = {
                name: this.newTrigger.trim(),
            };
            this.triggerService.add(newTriggerObj).then((id) => {
                const newTrigger = { ...newTriggerObj, id };
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
    async onSubmit(event: Event) {
        console.log(
            "Submitting form with values:",
            "this.selectedSubstance",
            this.selectedSubstance,
            "this.datetime",
            this.datetime,
            "this.amount",
            this.amount,
            "this.mood",
            this.sentiment
        );
        event.preventDefault();
        if (
            this.selectedSubstance &&
            this.datetime &&
            this.amount &&
            this.sentiment
        ) {
            const triggers = this.triggers.filter((trigger) =>
                this.selectedTriggers.includes(trigger.name)
            );
            const newUsage = {
                substance: this.selectedSubstance.id,
                datetime: this.datetime,
                quantity: parseFloat(this.amount),
                sentiment: this.sentiments.findIndex(
                    (sentiment) => sentiment.label == this.sentiment
                ),
                trigger: triggers,
                cost: this.cost ? parseFloat(this.cost) : 0,
                craving: parseInt(this.cravingIntensity.toString()),
            } as UsageAddDto;

            // if the uesr filled the cost input, we need to store it
            let costData: CostAddDto | undefined = undefined;
            if (this.cost) {
                costData = {
                    value: parseFloat(this.cost),
                    substance: this.selectedSubstance.id,
                    date: this.datetime,
                };
            }

            await this.usageService.add(newUsage);
            
            try {
                if (costData) {
                    await this.costService.add(costData as CostAddDto);
                }
                
                // Record usage-filling with kept_usage = true
                const usageFilling: UsageFillingAddDto = {
                    datetime: new Date(),
                    substance: this.selectedSubstance.id,
                    motivational_factor: this.currentMotivationalFactor?.id,
                    alternative_activity: this.selectedAlternativeActivity ? this.selectedAlternativeActivity.id : undefined,
                    kept_usage: true
                };
                await this.usageFillingService.add(usageFilling);
                
            } catch (e) {
                console.error("Error recording usage data", e);
            }

            this.submit.emit(newUsage);

            this.messageService.add({
                severity: "success",
                summary: "Success",
                detail: "Substance use recorded successfully!",
                life: 3000,
            });

            // Reset form
            this.selectedSubstance = undefined;
            this.amount = "";
            this.sentiment = "";
            this.selectedTriggers = [];
            this.cost = "";
            this.cravingIntensity = 5;
            this.showCostInput = false;
            this.selectedAlternativeActivity = undefined;
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

        this.motivationalFactorService
            .getSubstanceFactors(substance.id)
            .then((factors) => {
                this.motivationalFactors = factors as MotivationalFactorDto[];
                if (this.motivationalFactors.length > 0) {
                    const randomIdx = Math.floor(
                        Math.random() * this.motivationalFactors.length
                    );
                    this.currentMotivationalFactor =
                        this.motivationalFactors[randomIdx];
                } else {
                    this.currentMotivationalFactor = null;
                }
            });
        // Emit event to show alternatives overlay
        this.showAlternatives.emit();
    }

    /**
     * Handles when a user selects an alternative activity.
     * Emits the selected alternative to the parent component.
     * @param alternative The selected alternative activity.
     */
    handleSelectAlternative(alternative: any): void {
        // Store the selected alternative activity
        this.selectedAlternativeActivity = {
            id: alternative.id,
            name: alternative.name
        };
        
        // Emit the selected alternative
        this.selectAlternative.emit({
            id: alternative.id,
            name: alternative.name
        });
    }
    
    /**
     * Handles when the user decides to give up using the substance.
     * Records this choice along with motivational factor and alternative activity data.
     */
    handleGiveUpUsage() {
        this.close.emit();
        if (!this.selectedSubstance) return;
        
        // Create a usage-filling record with kept_usage = false
        const usageFilling: UsageFillingAddDto = {
            datetime: new Date(),
            substance: this.selectedSubstance.id,
            motivational_factor: this.currentMotivationalFactor?.id,
            alternative_activity: this.selectedAlternativeActivity ? this.selectedAlternativeActivity.id : undefined,
            kept_usage: false
        };
        
        // Add the record to the database
        this.usageFillingService.add(usageFilling)
            .then(() => {
                // Show success message to user
                this.messageService.add({
                    severity: "success",
                    summary: "Great decision!",
                    detail: "You successfully avoided using the substance. Keep up the good work!",
                    life: 5000,
                });
                
                // Close the form
                this.close.emit();
            })
            .catch(error => {
                console.error("Error recording usage filling:", error);
            });
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
