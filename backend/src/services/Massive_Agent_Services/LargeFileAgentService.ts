import { AgentCoordinatorService } from './AgentCoordinatorService';
import { DeepSeekModelService } from '../DeepSeek_AI_Services/DeepSeekModelService';
import Logger from '../../utils/Logger/Logger';
import fs from 'fs';
import path from 'path';

const STORAGE_ROOT = path.join(process.cwd(), 'project_storage');

export class LargeFileAgentService {
    private coordinatorService: AgentCoordinatorService;
    private deepSeekService: DeepSeekModelService;

    constructor() {
        this.coordinatorService = AgentCoordinatorService.getInstance();
        this.deepSeekService = new DeepSeekModelService();
        // دڵنیابوون لە هەبوونی فۆڵدەری هەڵگرتن
        if (!fs.existsSync(STORAGE_ROOT)) {
            fs.mkdirSync(STORAGE_ROOT, { recursive: true });
        }
    }

    /**
     * @function startLargeFileUpload - دروستکردنی شوێنی هەڵگرتنی کاتی بۆ ئەپڵۆدی زەبەلاح
     * (لە پڕۆژەی ڕاستەقینەدا، ئەمە لە ڕێگەی Stream Serverەوە دەکرێت)
     */
    public async startLargeFileUpload(projectId: string, fileName: string): Promise<{ uploadPath: string, message: string }> {
        const projectDir = path.join(STORAGE_ROOT, projectId);
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir, { recursive: true });
        }
        const tempFilePath = path.join(projectDir, fileName);
        
        // لەم کاتەدا، ئێمە تەنها شوێنەکە دەگەڕێنینەوە بۆ ئەوەی Client دەست بکات بە ناردنی داتا
        Logger.info(`Large File Agent: Prepared temp storage for ${fileName} at ${tempFilePath}`);
        return { 
            uploadPath: `/api/v1/storage/${projectId}/${fileName}`, // ئەمە ڕێگای APIی ئەپڵۆد دەبێت
            message: `Storage allocated for ${fileName}. Start streaming data now.`
        };
    }

    /**
     * @function analyzeAndModifyLargeFile
     * Agentەکە داواکاری گۆڕانکاری وەردەگرێت بۆ فایلێکی گەورە
     */
    public async analyzeAndModifyLargeFile(projectId: string, filePath: string, modificationPrompt: string): Promise<void> {
        const fullPath = path.join(STORAGE_ROOT, projectId, filePath);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`File not found in storage: ${filePath}`);
        }

        // 1. خوێندنەوەی بەشێکی بچووک یان شیکارکردنی Meta Dataی فایلەکە
        // (بۆ فایلە زەبەلاحەکان، هەمووی ناخوێندرێتەوە بۆ ناو Memory)
        const fileSize = fs.statSync(fullPath).size;
        
        // 2. ناردنی ئەرک بۆ DeepSeek بۆ بڕیاردان
        const deepSeekPrompt = `Analyze the file ${filePath} (Size: ${fileSize} bytes) and the user's request: "${modificationPrompt}". Determine the exact changes (line numbers, content replacement, or file move/rename). Return the action as a specific task for a Code Modification Agent.`;

        const aiResponse = await this.deepSeekService.getAICompletion({
            prompt: deepSeekPrompt,
            context: `Modifying large file ${filePath}`,
            modelName: 'DeepSeek-V2-LargeFile',
        });
        
        // 3. ناردنی ئەرک بۆ Code Modification Agent (کە بەشێکە لە 70 Agentەکە)
        // وا دانێ AIەکە وەڵامەکە بە فۆرماتی [TASK::CODE_MODIFY::{"path": ..., "changes": [...]}] دەداتەوە
        
        const actionDetails = JSON.parse(aiResponse.result.match(/\[TASK::CODE_MODIFY::(.+)\]/)?.[1] || '{}');
        
        await this.coordinatorService.assignTask({
            taskId: `MOD_${Date.now()}`,
            agentId: 'LARGE_FILE_AGENT',
            taskType: 'CODE_MODIFY', // ئەم Agentە کۆدەکان دەگۆڕێت
            projectPath: projectId,
            priority: 'HIGH',
            details: { ...actionDetails, modificationPrompt }
        } as unknown as any);
        
        Logger.info(`Large File Agent: Assigned modification task for ${filePath} based on AI analysis.`);
    }
}
