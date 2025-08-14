import { CommonModule } from "@angular/common";
import { Component, OnInit, signal, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { TriggerService } from "../../services/trigger.service";
import { TriggerDto } from "../../dto/trigger.dto";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { DropdownModule } from "primeng/dropdown";
import { ToggleButtonModule } from "primeng/togglebutton";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
    selector: "app-triggers",
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
        TranslocoModule
    ],
    providers: [MessageService],
    templateUrl: "./trigger_management.component.html",
})
export class TriggerManagementComponent implements OnInit {
    private triggerService = inject(TriggerService);
    private messageService = inject(MessageService);

    triggers = signal<TriggerDto[]>([]);
    archivedTriggers = signal<TriggerDto[]>([]);
    showArchived = signal(false);
    
    // Edit dialog
    showEditDialog = signal(false);
    editingTrigger: TriggerDto | null = null;
    editForm = {
        name: '',
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

    ngOnInit() {
        this.loadTriggers();
    }

    async loadTriggers() {
        try {
            const [activeTriggers, archivedTriggers] = await Promise.all([
                this.triggerService.getActiveTriggers(),
                this.triggerService.getArchivedTriggers()
            ]);
            
            this.triggers.set(activeTriggers);
            this.archivedTriggers.set(archivedTriggers);
        } catch (error) {
            console.error('Error loading triggers:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load triggers'
            });
        }
    }

    editTrigger(trigger: TriggerDto) {
        this.editingTrigger = { ...trigger };
        this.editForm = {
            name: trigger.name,
            archived: trigger.archived || 0
        };
        this.archivedToggle = this.editForm.archived === 1;
        this.showEditDialog.set(true);
    }

    async saveTrigger() {
        if (!this.editingTrigger || !this.editForm.name.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please enter a trigger name'
            });
            return;
        }

        try {
            const updatedTrigger: TriggerDto = {
                ...this.editingTrigger,
                name: this.editForm.name.trim(),
                archived: this.archivedToggle ? 1 : 0,
                archive_date: this.archivedToggle ? new Date() : null
            };

            await this.triggerService.edit(this.editingTrigger.id, updatedTrigger);
            
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Trigger updated successfully'
            });

            this.showEditDialog.set(false);
            this.editingTrigger = null;
            await this.loadTriggers();
        } catch (error) {
            console.error('Error updating trigger:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update trigger'
            });
        }
    }

    async archiveTrigger(trigger: TriggerDto) {
        try {
            await this.triggerService.archiveTrigger(trigger.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Trigger archived successfully'
            });
            await this.loadTriggers();
        } catch (error) {
            console.error('Error archiving trigger:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to archive trigger'
            });
        }
    }

    async unarchiveTrigger(trigger: TriggerDto) {
        try {
            await this.triggerService.unarchiveTrigger(trigger.id);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Trigger unarchived successfully'
            });
            await this.loadTriggers();
        } catch (error) {
            console.error('Error unarchiving trigger:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to unarchive trigger'
            });
        }
    }

    cancelEdit() {
        this.showEditDialog.set(false);
        this.editingTrigger = null;
        this.editForm = {
            name: '',
            archived: 0
        };
        this.archivedToggle = false;
    }

    onArchivedToggle(event: any) {
        this.editForm.archived = event.checked ? 1 : 0;
    }
}
