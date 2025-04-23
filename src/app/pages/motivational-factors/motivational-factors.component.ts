import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

type FactorCategory = 'health' | 'family' | 'financial' | 'personal' | 'other';

interface MotivationalFactor {
    id: string;
    type: 'text' | 'image' | 'audio';
    content: string;
    createdAt: Date;
    category?: FactorCategory;
    isFavorite?: boolean;
    order?: number;
    effectiveness?: number; // 0-100
}

interface Substance {
    id: string;
    name: string;
    motivationalFactors: MotivationalFactor[];
}

@Component({
    selector: "app-motivational-factors",
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: "./motivational-factors.component.html",
})
export class MotivationalFactorsComponent implements OnInit {
    substances: Substance[] = [];
    selectedSubstance: string | null = null;
    searchTerm = "";
    sortOrder: 'newest' | 'oldest' | 'type' = 'newest';
    isLoading = true;
    showAddModal = false;
    showEditModal = false;
    showDeleteConfirm: string | null = null;
    editingFactor: MotivationalFactor | null = null;
    editedContent = "";

    ngOnInit() {
        // Simulate loading substances (replace with real API/localStorage in production)
        this.substances = [
            { id: '1', name: 'Alcohol', motivationalFactors: [] },
            { id: '2', name: 'Cigarettes', motivationalFactors: [] },
            { id: '3', name: 'Cannabis', motivationalFactors: [] },
        ];
        if (this.substances.length > 0) {
            this.selectedSubstance = this.substances[0].id;
        }
        this.isLoading = false;
    }

    get currentSubstance(): Substance | undefined {
        return this.substances.find(s => s.id === this.selectedSubstance);
    }

    get filteredFactors(): MotivationalFactor[] {
        if (!this.currentSubstance) return [];
        let factors = [...this.currentSubstance.motivationalFactors];
        if (this.searchTerm) {
            factors = factors.filter(f =>
                f.type === 'text' &&
                f.content.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }
        switch (this.sortOrder) {
            case 'newest':
                factors.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                break;
            case 'oldest':
                factors.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
                break;
            case 'type':
                factors.sort((a, b) => a.type.localeCompare(b.type));
                break;
        }
        return factors;
    }

    openAddModal() {
        this.showAddModal = true;
    }

    closeAddModal() {
        this.showAddModal = false;
    }

    openEditModal(factor: MotivationalFactor) {
        this.editingFactor = { ...factor };
        this.editedContent = factor.content;
        this.showEditModal = true;
    }

    closeEditModal() {
        this.showEditModal = false;
        this.editingFactor = null;
    }

    openDeleteConfirm(id: string) {
        this.showDeleteConfirm = id;
    }

    closeDeleteConfirm() {
        this.showDeleteConfirm = null;
    }

    addMotivationalFactor(factor: Omit<MotivationalFactor, 'id' | 'createdAt'>) {
        if (!this.selectedSubstance) return;
        const newFactor: MotivationalFactor = {
            ...factor,
            id: Date.now().toString(),
            createdAt: new Date(),
        };
        this.substances = this.substances.map(sub =>
            sub.id === this.selectedSubstance
                ? { ...sub, motivationalFactors: [...sub.motivationalFactors, newFactor] }
                : sub
        );
        this.closeAddModal();
    }

    saveEditFactor() {
        if (!this.editingFactor || !this.selectedSubstance) return;
        const updated = { ...this.editingFactor, content: this.editedContent };
        this.substances = this.substances.map(sub =>
            sub.id === this.selectedSubstance
                ? {
                    ...sub,
                    motivationalFactors: sub.motivationalFactors.map(f =>
                        f.id === updated.id ? updated : f
                    ),
                }
                : sub
        );
        this.closeEditModal();
    }

    deleteFactor(id: string) {
        if (!this.selectedSubstance) return;
        this.substances = this.substances.map(sub =>
            sub.id === this.selectedSubstance
                ? {
                    ...sub,
                    motivationalFactors: sub.motivationalFactors.filter(f => f.id !== id),
                }
                : sub
        );
        this.closeDeleteConfirm();
    }
}
