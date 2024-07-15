import { Injectable } from '@angular/core';
import { ServiceAbstract } from './service.abstract';
import { firstValueFrom } from 'rxjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RecommendationService<T> extends ServiceAbstract<T> {
    storeName = 'recommendations';
    
    
    async fetchRecommendation(trigger: string): Promise<T> {
        let recommendation: T[] = await firstValueFrom(this.getByField('trigger', trigger));
        if (!recommendation.length) {
            // looks for recommendation in google gemini and then stores it to cache
            let text = await this.fetchRecommendationFromGemini(trigger);
            
            let success = await firstValueFrom(this.add({trigger, text} as T));
            if (success) {
                recommendation = [success];
            }
        }

        return recommendation[0];
    }

    async fetchRecommendationFromGemini(trigger: string): Promise<string> {
        const googleGemini = new GoogleGenerativeAI(environment.googleApiKey);
        // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
        const model = googleGemini.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Eu tenho um vício e estou tratando. Um dos principais gatilhos para eu começar a usar é "${trigger}". Me dê 4 dicas de como lidar melhor com esse gatilho e evitar consumir por causa dele.`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
}
