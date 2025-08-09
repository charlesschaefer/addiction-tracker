import { CommonModule } from "@angular/common";
import { Component, computed, OnInit, signal, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MotivationalFactorService } from "../../services/motivational-factor.service";
import { MotivationalFactorDto } from "../../dto/motivational-factor.dto";
import { SubstanceService } from "../../services/substance.service";
import { SubstanceDto } from "../../dto/substance.dto";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { MotivationalFactorInputComponent } from "../../components/motivational-factor/motivational-factor-input.component";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
    selector: "app-motivational-factors",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ToastModule,
        MotivationalFactorInputComponent,
        TranslocoModule,
    ],
    templateUrl: "./motivational-factors.component.html",
})
export class MotivationalFactorsComponent implements OnInit {
    private motivationalFactorService = inject(MotivationalFactorService);
    private substanceService = inject(SubstanceService);
    private messageService = inject(MessageService);

    substances: SubstanceDto[] = [];
    selectedSubstance = signal<number | null>(null);
    substancesMotivationalFactors = signal<
        Map<number, MotivationalFactorDto[]>
    >(new Map());
    motivationalFactors = computed(() => {
        console.log("Recomputando os fatores motivacionais");
        const selected = this.selectedSubstance();
        const substanceFactors = this.substancesMotivationalFactors();
        if (selected === null) return [];
        return substanceFactors.get(selected) || [];
    });
    searchTerm = "";
    sortOrder: "newest" | "oldest" | "type" = "newest";
    isLoading = true;
    showAddModal = false;
    showEditModal = false;
    showDeleteConfirm: number | null = null;
    editingFactor: MotivationalFactorDto | null = null;
    editedContent = "";

    ngOnInit() {
        this.substanceService.getActiveSubstances().then(async (subs) => {
            this.substances = subs as SubstanceDto[];
            if (this.substances.length > 0) {
                this.selectedSubstance.set(this.substances[0].id);
            }

            this.loadMotivationalFactors();
        });
    }

    loadMotivationalFactors() {
        this.motivationalFactorService.list().then((factors) => {
            this.substances.forEach((substance) => {
                const substanceFactors = factors.filter(
                    (factor) => factor.substance === substance.id
                ) as MotivationalFactorDto[];
                this.substancesMotivationalFactors.update((factor) => {
                    factor.set(substance.id, substanceFactors);

                    // returning a new Map to trigger the signal
                    // This is necessary because the signal does not detect changes in the Map object
                    // when we use the set method
                    // So we create a new Map with the same entries
                    // and return it to trigger the signal
                    // This is a workaround for the signal not detecting changes in the Map object
                    // This is a known issue in Angular signals
                    //
                    return new Map(factor);
                });
            });
            this.isLoading = false;
        });
    }

    get currentSubstance(): SubstanceDto | undefined {
        return this.substances.find((s) => s.id === this.selectedSubstance());
    }

    get filteredFactors(): MotivationalFactorDto[] {
        let factors = this.motivationalFactors();
        if (this.searchTerm) {
            factors = factors.filter(
                (f) =>
                    f.type === "text" &&
                    f.content
                        .toLowerCase()
                        .includes(this.searchTerm.toLowerCase())
            );
        }
        switch (this.sortOrder) {
            case "newest":
                factors.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );
                break;
            case "oldest":
                factors.sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                );
                break;
            case "type":
                factors.sort((a, b) => a.type.localeCompare(b.type));
                break;
        }
        return factors;
    }

    openAddModal() {
        this.showAddModal = true;
        this.editedContent = "";
    }

    closeAddModal() {
        this.showAddModal = false;
    }

    openEditModal(factor: MotivationalFactorDto) {
        this.editingFactor = { ...factor };
        this.editedContent = factor.content;
        this.showEditModal = true;
    }

    closeEditModal() {
        this.showEditModal = false;
        this.editingFactor = null;
    }

    openDeleteConfirm(id?: number) {
        this.showDeleteConfirm = id as number;
    }

    closeDeleteConfirm() {
        this.showDeleteConfirm = null;
    }

    addMotivationalFactor(data: {
        substance: number;
        type: string;
        content: string;
    }) {
        console.log("Adding motivational factor");
        if (!this.currentSubstance) {
            this.messageService.add({
                severity: "error",
                summary: "Error",
                detail: "Please select a substance.",
            });
            return;
        }
        const newFactor: MotivationalFactorDto = {
            type: data.type,
            content: data.content,
            substance: data.substance,
            createdAt: new Date(),
        } as MotivationalFactorDto;
        this.motivationalFactorService.add(newFactor).then(() => {
            // Reload all factors from the service and update the map
            this.loadMotivationalFactors();
            this.closeAddModal();
        });
    }

    saveEditFactor() {
        if (!this.editingFactor || !this.selectedSubstance) return;
        const updated = { ...this.editingFactor, content: this.editedContent };
        this.motivationalFactorService.edit(updated.id!, updated).then(() => {
            this.loadMotivationalFactors();
            this.closeEditModal();
        });
    }

    deleteFactor(id: number) {
        this.motivationalFactorService.remove(id).then(() => {
            this.loadMotivationalFactors();
            this.closeDeleteConfirm();
        });
    }
}
