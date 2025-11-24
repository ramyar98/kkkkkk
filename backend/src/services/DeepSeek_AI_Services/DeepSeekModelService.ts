import axios from 'axios';
import * as crypto from 'crypto';
import Logger from '../../utils/Logger/Logger';

/**
 * @interface IAICompletionResponse - شێوەی وەڵامی پێوانەیی (Standard Response)
 */
interface IAICompletionResponse {
    result: string;
    usage: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
}

/**
 * @interface IAIRequestPayload - شێوەی داواکاری بۆ AI
 */
interface IAIRequestPayload {
    prompt: string;
    context: string;
    modelName: string;
}

/**
 * @class DeepSeekModelService - مامەڵەکردن لەگەڵ DeepSeek AI API
 */
export class DeepSeekModelService {
    private readonly API_BASE_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
    private readonly API_KEY = process.env.DEEPSEEK_API_KEY;

    constructor() {
        if (!this.API_KEY) {
            Logger.error('DEEPSEEK_API_KEY is not set in environment variables.');
        }
    }

    /**
     * @function calculatePromptHash - دروستکردنی Hash بۆ Prompt
     * گرنگە بۆ Cacheکردن یان دۆزینەوەی داواکاریی دووبارە (بۆ خێرایی 20x)
     */
    public calculatePromptHash(prompt: string): string {
        return crypto.createHash('sha256').update(prompt).digest('hex');
    }

    /**
     * @function getAICompletion - ناردنی داواکاری بۆ مۆدێلی DeepSeek
     */
    public async getAICompletion(payload: IAIRequestPayload): Promise<IAICompletionResponse> {
        // لۆژیکی Cacheکردن دەتوانرێت لێرە زیاد بکرێت بۆ وەڵامی خێرا
        // const hash = this.calculatePromptHash(payload.prompt + payload.context);
        // const cachedResponse = await CacheService.get(hash); 
        // if (cachedResponse) return cachedResponse;
        
        const messages = [
            {
                role: "system",
                content: `تۆ Create App Builder AIی، مۆدێلێکی زەبەلاح و بەهێزی ${payload.modelName} کە بۆ دروستکردنی کۆدی فلاتەر و چاککردنی کێشە بە خێرایی 20x ڕێکخراوی. کۆدەکان بە تەواوی و ورد بنووسە.`
            },
            {
                role: "user",
                content: `پڕۆژەکە: ${payload.context}\n\nداواکاریی بەکارهێنەر: ${payload.prompt}`
            }
        ];

        try {
            const response = await axios.post(
                `${this.API_BASE_URL}/chat/completions`,
                {
                    model: payload.modelName,
                    messages: messages,
                    stream: false, // بۆ ئەوەی خێرا وەڵامی کۆتایی وەربگرین
                    temperature: 0.7,
                    max_tokens: 4096 // بەرزترین ڕێژە بۆ دروستکردنی کۆدی گەورە
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.API_KEY}`,
                    }
                }
            );

            // پێداچوونەوەی وردی وەڵام
            if (response.data.choices && response.data.choices.length > 0) {
                const completion = response.data.choices[0].message.content;
                const usage = response.data.usage;
                
                const finalResponse: IAICompletionResponse = {
                    result: completion,
                    usage: {
                        inputTokens: usage.prompt_tokens,
                        outputTokens: usage.completion_tokens,
                        totalTokens: usage.total_tokens
                    }
                };
                
                // CacheService.set(hash, finalResponse, 3600); // بۆ 1 کاتژمێر
                return finalResponse;

            } else {
                throw new Error("DeepSeek API did not return a valid choice.");
            }

        } catch (error) {
            Logger.error('Failed to communicate with DeepSeek API:', { message: (error as Error).message, details: (error as any).response?.data });
            throw new Error(`AI Communication Error: ${(error as any).response?.data?.error?.message || 'Unknown API Error'}`);
        }
    }
}
