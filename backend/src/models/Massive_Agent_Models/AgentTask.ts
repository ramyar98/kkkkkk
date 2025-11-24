import mongoose, { Document, Schema, Model } from 'mongoose';
import { IBaseModel, createBaseSchema } from '../BaseModel';

/**
 * @interface IAgentTask - پێناسەی ئەرکێکی Agent
 */
export interface IAgentTask extends IBaseModel {
    taskId: string;
    agentId: string;
    taskType: 'CODE_FIX' | 'FEATURE_GENERATE' | 'HEALTH_CHECK' | 'SECURITY_SCAN' | 'DEPENDENCY_RESOLVE' | 'SYSTEM_UPDATE';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'QUEUED';
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    projectPath: string; // ڕێچکەی پڕۆژەی فلاتەر لەناو ژینگەکە
    details: {
        issueId?: string;
        description: string;
        suggestedFix?: string; // ئەگەر AI پێشنیاری چاککردنی کردبێت
        deepSeekModelUsed?: string;
    };
    logs: { timestamp: Date; message: string }[];
    completionTimeMs: number;
}

// پێناسەی Schema بۆ AgentTask
const AgentTaskSchema = createBaseSchema({
    taskId: { type: String, required: true, unique: true, index: true },
    agentId: { type: String, required: true, index: true },
    taskType: { 
        type: String, 
        required: true, 
        enum: ['CODE_FIX', 'FEATURE_GENERATE', 'HEALTH_CHECK', 'SECURITY_SCAN', 'DEPENDENCY_RESOLVE', 'SYSTEM_UPDATE'] 
    },
    status: { 
        type: String, 
        required: true, 
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'QUEUED'],
        default: 'QUEUED'
    },
    priority: { 
        type: String, 
        required: true, 
        enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
        default: 'MEDIUM'
    },
    projectPath: { type: String, required: true },
    details: { 
        type: Object, 
        required: true 
    },
    logs: { type: [{ timestamp: Date, message: String }], default: [] },
    completionTimeMs: { type: Number, default: 0, index: true }, // گرنگە بۆ چاودێری خێرایی 20x
});

// دروستکردنی Indexی فرە-کێڵگەیی (Compound Index) بۆ خێرایی گەڕان
AgentTaskSchema.index({ agentId: 1, status: 1, priority: -1 });

/**
 * @model AgentTaskModel
 */
export const AgentTaskModel: Model<IAgentTask> = mongoose.model<IAgentTask>('AgentTask', AgentTaskSchema);
