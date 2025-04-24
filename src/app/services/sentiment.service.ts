import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class SentimentService {
    static sentiments = [
        { emoji: "😢", label: "Sad" },
        { emoji: "😟", label: "Anxious" },
        { emoji: "😐", label: "Neutral" },
        { emoji: "🙂", label: "Good" },
        { emoji: "😄", label: "Great" },
    ];
}
