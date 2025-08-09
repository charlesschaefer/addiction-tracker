import { CommonModule } from "@angular/common";
import { Component, OnInit, signal, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { SubstanceService } from "../../services/substance.service";
import { SubstanceDto, SubstanceIcon } from "../../dto/substance.dto";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { ToggleButtonModule } from "primeng/togglebutton";
import { TranslocoModule } from "@jsverse/transloco";
import { SubstanceIconSelectComponent } from "../../components/substance/substance-icon-select.component";

@Component({
    selector: "app-substances",
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ToastModule,
        ButtonModule,
        CardModule,
        DialogModule,
        InputTextModule,
        DropdownModule,
        ToggleButtonModule,
        TranslocoModule,
        SubstanceIconSelectComponent
    ],
    providers: [MessageService],
    templateUrl: "./substances.component.html",
})
export class SubstancesComponent implements OnInit {
    private substanceService = inject(SubstanceService);
    private messageService = inject(MessageService);

    substances = signal<SubstanceDto[]>([]);
    archivedSubstances = signal<SubstanceDto[]>([]);
    showArchived = signal(false);
    
    // Edit dialog
    showEditDialog = signal(false);
    editingSubstance: SubstanceDto | null = null;
    editForm = {
        name: '',
        icon: null as SubstanceIcon | null,
        archived: 0 // 0 for false, 1 for true
    };

    // Boolean property for the toggle button
    archivedToggle = false;

    // Computed property for the toggle button
    get archivedBoolean(): boolean {
        return this.editForm.archived === 1;
    }

    set archivedBoolean(value: boolean) {
        this.editForm.archived = value ? 1 : 0;
    }

    // Getter for current icon
    get currentIcon(): SubstanceIcon | null {
        return this.editingSubstance?.icon || null;
    }

    ngOnInit() {
        this.loadSubstances();
    }

    async loadSubstances() {
        try {
            const [activeSubstances, archivedSubstances] = await Promise.all([
                this.substanceService.getActiveSubstances(),
                this.substanceService.getArchivedSubstances()
            ]);
            
            this.substances.set(activeSubstances);
            this.archivedSubstances.set(archivedSubstances);
        } catch (error) {
            console.error('Error loading substances:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load substances'
            });
        }
    }

    editSubstance(substance: SubstanceDto) {
        this.editingSubstance = { ...substance };
        this.editForm = {
            name: substance.name,
            icon: substance.icon || null,
            archived: substance.archived || 0
        };
        this.archivedToggle = this.editForm.archived === 1;
        this.showEditDialog.set(true);
    }

    async saveSubstance() {
        if (!this.editingSubstance || !this.editForm.name.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please enter a substance name'
            });
            return;
        }

        try {
            const updatedSubstance: SubstanceDto = {
                ...this.editingSubstance,
                name: this.editForm.name.trim(),
                icon: this.editForm.icon || undefined,
                archived: this.archivedToggle ? 1 : 0,
                archive_date: this.archivedToggle ? new Date() : null
            };

            await this.substanceService.edit(this.editingSubstance.id, updatedSubstance);
            
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Substance updated successfully'
            });

            this.showEditDialog.set(false);
            this.editingSubstance = null;
            await this.loadSubstances();
        } catch (error) {
            console.error('Error updating substance:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update substance'
            });
        }
    }

    async archiveSubstance(substance: SubstanceDto) {
        try {
            await this.substanceService.archiveSubstance(substance.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Substance archived successfully'
            });
            await this.loadSubstances();
        } catch (error) {
            console.error('Error archiving substance:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to archive substance'
            });
        }
    }

    async unarchiveSubstance(substance: SubstanceDto) {
        try {
            await this.substanceService.unarchiveSubstance(substance.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Substance unarchived successfully'
            });
            await this.loadSubstances();
        } catch (error) {
            console.error('Error unarchiving substance:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to unarchive substance'
            });
        }
    }

    cancelEdit() {
        this.showEditDialog.set(false);
        this.editingSubstance = null;
        this.editForm = {
            name: '',
            icon: null,
            archived: 0
        };
        this.archivedToggle = false;
    }

    onArchivedToggle(event: any) {
        this.editForm.archived = event.checked ? 1 : 0;
    }

    getSubstanceIcon(substance: SubstanceDto): string {
        return substance.icon || 'circle';
    }

    getSubstanceIconClass(substance: SubstanceDto): string {
        const icon = this.getSubstanceIcon(substance);
        return `pi pi-${icon}`;
    }
}
