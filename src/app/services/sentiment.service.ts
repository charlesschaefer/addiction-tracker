import { Injectable } from "@angular/core";

/**
 * Service providing sentiment options for usage entries.
 */
@Injectable({
    providedIn: "root",
})
export class SentimentService {
    /**
     * List of available sentiments with emoji and label.
     */
    static sentiments = [
        { emoji: "😢", label: "Sad" },
        { emoji: "😟", label: "Anxious" },
        { emoji: "😐", label: "Neutral" },
        { emoji: "🙂", label: "Good" },
        { emoji: "😄", label: "Great" },
    ];
}
