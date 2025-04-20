import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MotivationalFactorDto } from "../dto/motivational-factor.dto";


@Component({
    selector: "app-motivational-factor-input",
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: "./motivational-factor-input.component.html",
})
export class MotivationalFactorInputComponent {
    @Input() substance!: number;
    @Output() add = new EventEmitter<
        Omit<MotivationalFactorDto, "id" | "createdAt">
    >();

    type: "text" | "image" | "audio" = "text";
    content = "";
    isRecording = false;
    audioURL: string | null = null;
    mediaRecorder: any = null;
    audioChunks: Blob[] = [];

    handleTextSubmit() {
        if (this.content.trim()) {
            this.add.emit({
                substance: this.substance,
                type: "text",
                content: this.content,
            });
            this.content = "";
        }
    }

    handleImageUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                this.add.emit({
                    substance: this.substance,
                    type: "image",
                    content: base64String,
                });
            };
            reader.readAsDataURL(file);
            input.value = "";
        }
    }

    async startRecording() {
        try {
            const stream = await (navigator.mediaDevices as any).getUserMedia({
                audio: true,
            });
            this.mediaRecorder = new (window as any).MediaRecorder(stream);
            this.audioChunks = [];
            this.mediaRecorder.ondataavailable = (e: any) => {
                if (e.data.size > 0) {
                    this.audioChunks.push(e.data);
                }
            };
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, {
                    type: "audio/wav",
                });
                this.audioURL = URL.createObjectURL(audioBlob);
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    this.add.emit({
                        substance: this.substance,
                        type: "audio",
                        content: base64data,
                    });
                };
            };
            this.mediaRecorder.start();
            this.isRecording = true;
        } catch (error) {
            alert(
                "Could not access your microphone. Please check permissions."
            );
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.mediaRecorder.stream
                .getTracks()
                .forEach((track: any) => track.stop());
        }
    }
}
