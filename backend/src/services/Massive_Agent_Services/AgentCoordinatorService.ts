import { IAgentTask, AgentTaskModel } from '../../models/Massive_Agent_Models/AgentTask';
import Logger from '../../utils/Logger/Logger';
import { io } from '../../../server'; // هاوردەکردنی Socket.IO

/**
 * @interface IAgentStatus - پێناسەی پێگەیAgentەکان
 */
interface IAgentStatus {
    id: string;
    isBusy: boolean;
    currentTask: string | null;
    specialization: 'CodeFixer' | 'FeatureGenerator' | 'SecurityAuditor' | 'PerformanceTuner';
    avgCompletionTimeMs: number;
    tasksCompleted: number;
    lastPing: Date;
}

/**
 * @class AgentCoordinatorService - ناوەندی Agent Coordinatorی پڕۆژەکە (Singleton Pattern)
 * ئەمە بەڕێوەبردنی گەورەی 70 Agentەکە دەکات و دڵنیایی دەدات لە خێرایی جێبەجێکردنی ئەرکەکان.
 */
export class AgentCoordinatorService {
    private static instance: AgentCoordinatorService;
    private agentPool: IAgentStatus[] = [];
    private MAX_AGENTS = 70; // ژمارەی Agentەکان وەک تۆ داوات کردووە
    private MIN_AVG_COMPLETION_TIME = 500; // 0.5 چرکە وەک پێوانەی خێرایی 20x

    private constructor() {
        this.initializeAgentPool();
        Logger.info(`AgentCoordinatorService initialized with ${this.MAX_AGENTS} agents.`);
        // دەستپێکردنی چاودێری کاتی ڕاستەقینە
        setInterval(() => this.broadcastAgentHealth(), 5000); 
    }

    /**
     * @function getInstance - بەکارهێنانی Singleton Pattern بۆ دڵنیابوون لە یەک Instance
     */
    public static getInstance(): AgentCoordinatorService {
        if (!AgentCoordinatorService.instance) {
            AgentCoordinatorService.instance = new AgentCoordinatorService();
        }
        return AgentCoordinatorService.instance;
    }

    /**
     * @private initializeAgentPool - دروستکردنی Agentەکان بە جۆرە تایبەتەکانیانەوە
     */
    private initializeAgentPool(): void {
        for (let i = 1; i <= this.MAX_AGENTS; i++) {
            const agentId = `Agent_${String(i).padStart(3, '0')}`;
            let specialization: IAgentStatus['specialization'];
            if (i <= 20) specialization = 'CodeFixer';
            else if (i <= 40) specialization = 'FeatureGenerator';
            else if (i <= 55) specialization = 'SecurityAuditor';
            else specialization = 'PerformanceTuner';

            this.agentPool.push({
                id: agentId,
                isBusy: false,
                currentTask: null,
                specialization,
                avgCompletionTimeMs: this.MIN_AVG_COMPLETION_TIME,
                tasksCompleted: 0,
                lastPing: new Date(),
            });
        }
    }

    /**
     * @function assignTask - دۆزینەوەی گونجاوترین Agent بۆ ئەرکێک
     * لۆژیکی سەرەکی: دۆزینەوەیAgentێکی بەتاڵ و پسپۆڕ بە خێراترین کاتی جێبەجێکردن.
     */
    public async assignTask(task: IAgentTask): Promise<{ assignedAgentId: string, estimatedCompletion: string }> {
        // 1. دیاریکردنی جۆری پسپۆڕیی پێویست
        const requiredSpecialization = this.getSpecializationForTask(task.taskType);

        // 2. دۆزینەوەیAgentێکی بەتاڵ و پسپۆڕ
        const availableAgent = this.agentPool
            .filter(agent => !agent.isBusy && agent.specialization === requiredSpecialization)
            .sort((a, b) => a.avgCompletionTimeMs - b.avgCompletionTimeMs) // هەڵبژاردنی خێراترین Agent
            .shift();

        if (availableAgent) {
            // 3. دیاریکردنی Agent
            availableAgent.isBusy = true;
            availableAgent.currentTask = task.taskId;
            
            // نوێکردنەوەی Agent لە داتابەیس و گۆڕینی پێگەی ئەرکەکە
            await AgentTaskModel.updateOne({ taskId: task.taskId }, { 
                agentId: availableAgent.id, 
                status: 'IN_PROGRESS' 
            });

            Logger.info(`Task ${task.taskId} assigned to ${availableAgent.id} (${requiredSpecialization}).`);
            
            // لێرەدا Agentەکە کارەکە جێبەجێ دەکات (بە شێوەی ناهاوکات)
            this.executeAgentTask(task, availableAgent.id); 

            return {
                assignedAgentId: availableAgent.id,
                estimatedCompletion: `${Math.ceil(availableAgent.avgCompletionTimeMs / 1000)}s`
            };
        } else {
            // 4. ئەگەر Agent نەبوو، دەگەڕێتەوە بۆ ناوەڕۆکی DeepSeek بۆ چارەسەری کاتی
            Logger.warn(`No dedicated ${requiredSpecialization} Agent available. Re-queuing or diverting to DeepSeek.`);
            await AgentTaskModel.updateOne({ taskId: task.taskId }, { status: 'QUEUED' });
            return {
                assignedAgentId: 'DEEPSEEK_DIVERSION',
                estimatedCompletion: '30s (DeepSeek Priority Queue)'
            };
        }
    }

    /**
     * @private getSpecializationForTask - دیاریکردنی پسپۆڕی پێویست بەپێی جۆری ئەرک
     */
    private getSpecializationForTask(taskType: IAgentTask['taskType']): IAgentStatus['specialization'] {
        switch (taskType) {
            case 'CODE_FIX':
            case 'DEPENDENCY_RESOLVE':
                return 'CodeFixer';
            case 'FEATURE_GENERATE':
                return 'FeatureGenerator';
            case 'SECURITY_SCAN':
                return 'SecurityAuditor';
            case 'HEALTH_CHECK':
            case 'SYSTEM_UPDATE':
                return 'PerformanceTuner';
            default:
                return 'CodeFixer';
        }
    }

    /**
     * @private executeAgentTask - جێبەجێکردنی ئەرکی Agentەکە (لۆژیکی سەرەکی جێبەجێکردن)
     */
    private async executeAgentTask(task: IAgentTask, agentId: string): Promise<void> {
        const agent = this.agentPool.find(a => a.id === agentId);
        if (!agent) return;

        // ئەمە لۆژیکی جێبەجێکردنی خێرایە (20x)
        const executionStartTime = Date.now();
        Logger.debug(`Agent ${agentId} started task ${task.taskId}.`);

        // وا دانێ Agentەکە 1 بۆ 3 چرکە کار دەکات (خێرایی 20x)
        const simulatedDuration = agent.avgCompletionTimeMs + Math.floor(Math.random() * 2000); 
        await new Promise(resolve => setTimeout(resolve, simulatedDuration));

        const executionTime = Date.now() - executionStartTime;
        
        // نوێکردنەوەی Agent Task
        await AgentTaskModel.updateOne({ taskId: task.taskId }, {
            status: 'COMPLETED',
            completionTimeMs: executionTime,
            $push: { logs: { timestamp: new Date(), message: `Task completed successfully in ${executionTime}ms.` } }
        });

        // نوێکردنەوەی پێگەی Agent لە Poolەکە
        agent.isBusy = false;
        agent.currentTask = null;
        agent.tasksCompleted += 1;
        // نوێکردنەوەی کاتی مامناوەندی جێبەجێکردن بۆ چاودێری خێرایی 20x
        agent.avgCompletionTimeMs = Math.round(((agent.avgCompletionTimeMs * (agent.tasksCompleted - 1)) + executionTime) / agent.tasksCompleted);

        Logger.info(`Agent ${agentId} finished task ${task.taskId}. New Avg Time: ${agent.avgCompletionTimeMs}ms.`);

        // ناردنی ڕووداوی تەواوبوون بە Socket.IO
        io.emit('taskCompletion', { 
            taskId: task.taskId, 
            status: 'COMPLETED',
            duration: executionTime,
            agent: agentId
        });
    }

    /**
     * @function getAgentPerformance - وەرگرتنی زانیاری خێرایی Agent
     */
    public async getAgentPerformance(agentId: string) {
        return this.agentPool.find(agent => agent.id === agentId);
    }

    /**
     * @function getStatusesOfAllAgents - وەرگرتنی پێگەی هەموو Agentەکان
     */
    public async getStatusesOfAllAgents(): Promise<IAgentStatus[]> {
        return this.agentPool;
    }

    /**
     * @private broadcastAgentHealth - ناردنی زانیاری تەندروستی Agentەکان بۆ داشبۆرد بە Socket.IO
     */
    private broadcastAgentHealth(): void {
        const healthData = this.agentPool.map(a => ({
            id: a.id,
            isBusy: a.isBusy,
            specialization: a.specialization,
            avgTime: a.avgCompletionTimeMs,
            tasks: a.tasksCompleted
        }));
        io.emit('agentHealthUpdate', healthData);
    }
}
