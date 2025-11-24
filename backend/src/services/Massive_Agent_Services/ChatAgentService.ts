import { DeepSeekModelService } from '../DeepSeek_AI_Services/DeepSeekModelService';
import { AgentCoordinatorService } from './AgentCoordinatorService';
import { DeepSeekRequestModel, IDeepSeekRequest } from '../../models/DeepSeek_AI_Models/DeepSeekRequest';
import Logger from '../../utils/Logger/Logger';

// Agentی تایبەت بە گفتوگۆ
export class ChatAgentService {
    private deepSeekService: DeepSeekModelService;
    private coordinatorService: AgentCoordinatorService;
    private conversationMemory: Map<string, string[]> = new Map(); // بۆ هەڵگرتنی مێژووی گفتوگۆ بە ProjectID

    constructor() {
        this.deepSeekService = new DeepSeekModelService();
        this.coordinatorService = AgentCoordinatorService.getInstance();
    }

    /**
     * @function processChatMessage - وەرگرتنی پەیامی چات و بڕیاردان لەسەر کارەکە
     */
    public async processChatMessage(projectId: string, userId: string, message: string): Promise<{ response: string, actionTaken: string }> {
        // 1. وەرگرتنی مێژووی گفتوگۆ (Memory)
        const history = this.conversationMemory.get(projectId) || [];
        
        // 2. دروستکردنی Promptێکی گەورە بۆ AI (DeepSeek)
        const systemPrompt = `
            تۆ Chat Agentی تایبەت بە پڕۆژەی فلاتەر. 
            ئەرکی تۆ: 
            1. وەڵامدانەوەی پرسیارەکانی بەکارهێنەر. 
            2. ئەگەر داواکاری گۆڕانکاری کۆد یان زیادکردنی فایل بوو، پێویستە فەرمانی Agent Coordinator دروست بکەیت.
            3. هەموو کاتێک ڕەچاوی مێژووی گفتوگۆ بکە.
            پڕۆژەی ئێستا: [Project ID: ${projectId}, Project State: LATEST_STATE_HASH].
        `;
        
        const fullPrompt = systemPrompt + "\n\n" + history.join('\n') + `\nUser: ${message}`;
        
        // 3. داواکردن لە DeepSeek بۆ بڕیاردان و وەڵامدانەوە
        const aiResponse = await this.deepSeekService.getAICompletion({
            prompt: fullPrompt,
            context: `Current Project Context for ${projectId}`, // وەسفی کورت بۆ Agent
            modelName: 'DeepSeek-V2-Chat', 
        });

        const rawResponse = aiResponse.result;
        let finalResponse = rawResponse;
        let action = 'None';

        // 4. شیکارکردنی وەڵامی AI بۆ ئەنجامدانی کار
        // Agents لە Backend فەرمانەکان بە [TASK::TYPE::DETAILS] جێبەجێ دەکەن
        if (rawResponse.includes('[TASK::')) {
            const taskMatch = rawResponse.match(/\[TASK::(\w+)::(.+)\]/);
            if (taskMatch) {
                const taskType = taskMatch[1] as any;
                const details = taskMatch[2];
                
                // ناردنی کارەکە بۆ Agent Coordinator
                const assignmentResult = await this.coordinatorService.assignTask({
                    taskId: `CHAT_${Date.now()}`,
                    agentId: 'CHAT_AGENT', 
                    taskType: taskType,
                    projectPath: projectId, 
                    priority: 'HIGH',
                    details: { description: details, requestedBy: userId }
                } as unknown as any); // Type casting

                action = `Assigned task ${taskType} to ${assignmentResult.assignedAgentId}`;
                // وەڵامێکی گونجاو بۆ بەکارهێنەر
                finalResponse = rawResponse.replace(taskMatch[0], `باشە! Agentی ${assignmentResult.assignedAgentId} دەستیکرد بە جێبەجێکردنی داواکارییەکەت (${taskType}).`);
            }
        }

        // 5. نوێکردنەوەی مێژووی گفتوگۆ
        history.push(`User: ${message}`);
        history.push(`AI: ${finalResponse}`);
        // پاراستنی قەبارەی مێژوو بۆ 50 پەیامی کۆتایی
        this.conversationMemory.set(projectId, history.slice(-50)); 
        
        // 6. تۆمارکردنی گفتوگۆ لە داتابەیس (بۆ چاودێری)
        this.recordChatInteraction(projectId, userId, message, finalResponse, action);

        return { response: finalResponse, actionTaken: action };
    }

    private async recordChatInteraction(projectId: string, userId: string, message: string, response: string, action: string) {
        // تۆمارکردنی گفتوگۆ لە DeepSeekRequestModel (بۆ ئاسانی)
        const chatRecord = new DeepSeekRequestModel({
            requestId: `CHAT_${Date.now()}`,
            sourceAgentId: 'CHAT_AGENT',
            modelName: 'DeepSeek-V2-Chat',
            promptHash: this.deepSeekService.calculatePromptHash(message),
            inputTokens: 0, // ئەمە دواتر بە شێوەی وردتر دەژمێردرێت
            outputTokens: 0, 
            responseTimeMs: 0,
            requestData: { projectId, message },
            responseData: { success: true, result: response, action }
        });
        await chatRecord.save().catch(e => Logger.error('Failed to save chat record', e));
    }
}
