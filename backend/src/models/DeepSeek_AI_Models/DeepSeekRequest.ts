import mongoose, { Document, Schema, Model } from 'mongoose';
import { IBaseModel, createBaseSchema } from '../BaseModel';

/**
 * @interface IDeepSeekRequest - پێناسەی داواکارییەکی نێردراو بۆ DeepSeek یان هەر مۆدێلێکی دیکە
 */
export interface IDeepSeekRequest extends IBaseModel {
    requestId: string;
    sourceAgentId: string; // کام Agent ئەم داواکارییەی ناردووە
    modelName: string; // DeepSeek-V2, GPT-4, etc.
    promptHash: string; // Hashی ناوەڕۆکی داواکارییەکە بۆ دۆزینەوەی داواکاریی دووبارە
    inputTokens: number;
    outputTokens: number;
    responseTimeMs: number; // گرنگە بۆ پێوانەی خێرایی (20x Speed)
    requestData: {
        prompt: string;
        context: string; // بۆ نموونە، کۆدی فایلی main.dart
        temperature: number;
    };
    responseData: {
        success: boolean;
        result: string; // وەڵامە سەرەکییەکەی DeepSeek
        error?: string;
    };
}

// پێناسەی Schema بۆ DeepSeekRequest
const DeepSeekRequestSchema = createBaseSchema({
    requestId: { type: String, required: true, unique: true, index: true },
    sourceAgentId: { type: String, required: true, index: true },
    modelName: { type: String, required: true },
    promptHash: { type: String, required: true },
    inputTokens: { type: Number, required: true, default: 0 },
    outputTokens: { type: Number, required: true, default: 0 },
    responseTimeMs: { type: Number, required: true, index: true },
    requestData: { type: Object, required: true },
    responseData: { type: Object, required: true },
});

// Indexی خێرا بۆ گەڕان بەپێی Agent و خێرایی
DeepSeekRequestSchema.index({ sourceAgentId: 1, responseTimeMs: 1 });

/**
 * @model DeepSeekRequestModel
 */
export const DeepSeekRequestModel: Model<IDeepSeekRequest> = mongoose.model<IDeepSeekRequest>('DeepSeekRequest', DeepSeekRequestSchema);
