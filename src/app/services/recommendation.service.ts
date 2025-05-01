import { Injectable, Inject } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { RecommendationDto, RecommendationAddDto } from '../dto/recommendation.dto';
import { AppDb } from '../app.db';
import { firstValueFrom } from 'rxjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { invoke } from '@tauri-apps/api/core';
import { DbService } from './db.service';

/**
 * Structure for Google API secret.
 */
interface ApiSecret {
    project: string,
    api_key: string
}

type Recommendations = RecommendationDto | RecommendationAddDto;

/**
 * Service for fetching and caching recommendations.
 */
@Injectable({
    providedIn: 'root'
})
export class RecommendationService extends ServiceAbstract<Recommendations> {
    protected override storeName: 'recommendation' = 'recommendation';

    /**
     * Injects the database service and sets up the table.
     */
    constructor(
        protected override dbService: DbService
    ) {
        super();
        this.setTable();
    }
    
    /**
     * Gets a recommendation for a trigger, fetching from Gemini if not cached.
     * @param trigger Trigger string
     * @returns Recommendation object
     */
    async fetchRecommendation(trigger: string): Promise<Recommendations> {
        let recommendation: Recommendations[] = await this.getByField('trigger', trigger);
        if (!recommendation.length) {
            // Looks for recommendation in Google Gemini and then stores it to cache
            const text = await this.fetchRecommendationFromGemini(trigger);
            
            const success = await this.add({trigger, text} as unknown as RecommendationAddDto);
            if (success) {
                recommendation = [success];
            }
        }

        return recommendation[0];
    }

    /**
     * Fetches a recommendation from Google Gemini API.
     * @param trigger Trigger string
     * @returns Recommendation text
     */
    async fetchRecommendationFromGemini(trigger: string): Promise<string> {
        const secrets: ApiSecret = await invoke("get_google_secrets");

        // Initialize Google Gemini API with the secret API key
        const googleGemini = new GoogleGenerativeAI(secrets.api_key);
        // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
        const model = googleGemini.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Eu tenho um vício e estou tratando. Um dos principais gatilhos para eu começar a usar é "${trigger}". Me dê 4 dicas de como lidar melhor com esse gatilho e evitar consumir por causa dele.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
}
