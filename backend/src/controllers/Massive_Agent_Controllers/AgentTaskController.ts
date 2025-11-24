import { Request, Response, NextFunction } from 'express';
import { AgentTaskModel, IAgentTask } from '../../models/Massive_Agent_Models/AgentTask';
import { AgentCoordinatorService } from '../../services/Massive_Agent_Services/AgentCoordinatorService'; // خزمەتگوزاری سەرەکی
import { v4 as uuidv4 } from 'uuid';
import Logger from '../../utils/Logger/Logger';

// Instanceی خزمەتگوزاری Agentەکان
const agentCoordinatorService = AgentCoordinatorService.getInstance();

/**
 * @function submitAgentTask - وەرگرتنی ئەرکێک لە بەکارهێنەر و ناردنی بۆ Agent Coordinator
 * Agent Coordinator (کە لۆژیکەکەی لە فۆڵدەری services دەنووسرێت) بڕیار دەدات کام Agent ئەو ئەرکە جێبەجێ بکات.
 */
export const submitAgentTask = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { taskType, projectPath, description, priority = 'MEDIUM' } = req.body;
        
        // 1. پێداچوونەوەی سەرەتایی (Validation)
        if (!taskType || !projectPath || !description) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'پێویستە جۆری ئەرک، ڕێچکەی پڕۆژە، و وەسف دیاری بکرێن.' 
            });
        }

        // 2. دروستکردنی ئەرکی نوێ
        const newTask: IAgentTask = new AgentTaskModel({
            taskId: uuidv4(),
            agentId: 'COORDINATOR_PENDING', // هێشتا Agent دیاری نەکراوە
            taskType,
            projectPath,
            priority,
            details: { description },
            status: 'QUEUED'
        } as unknown as IAgentTask); // Type casting پێویستە بۆ Mongoose

        await newTask.save();
        
        // 3. ناردنی ئەرکەکە بۆ Agent Coordinator بۆ بەڕێوەبردن (20x Speed Routing)
        const assignmentResult = await agentCoordinatorService.assignTask(newTask.toObject());

        // 4. ناردنەوەی وەڵامێکی خێرا بۆ فرۆنتئەند
        res.status(202).json({
            status: 'success',
            message: `ئەرکی Agent (ID: ${newTask.taskId}) بە سەرکەوتوویی نێردرا.`,
            assignedTo: assignmentResult.assignedAgentId,
            taskId: newTask.taskId,
            estimatedCompletion: assignmentResult.estimatedCompletion
        });

        // 5. ناردنی ڕووداوی کاتی ڕاستەقینە (Real-Time Event) بە Socket.IO
        (req as any).io.emit('taskUpdate', { 
            taskId: newTask.taskId, 
            status: 'ASSIGNED', 
            agent: assignmentResult.assignedAgentId,
            project: projectPath
        });

        Logger.info(`New Agent Task submitted: ${newTask.taskId}. Assigned to ${assignmentResult.assignedAgentId}`);

    } catch (error) {
        Logger.error('Error submitting Agent Task:', { error, body: req.body });
        next(error); // ناردنی هەڵەکە بۆ Global Error Handler لە server.ts
    }
};

/**
 * @function getTaskStatus - وەرگرتنی پێگەی ئەرکێک بە taskId
 */
export const getTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { taskId } = req.params;
        
        const task = await AgentTaskModel.findOne({ taskId }).lean();

        if (!task) {
            return res.status(404).json({ status: 'error', message: `ئەرک بە ID: ${taskId} نەدۆزرایەوە.` });
        }
        
        // زیادکردنی زانیاری خێرایی Agentەکە بۆ وەڵامەکە
        const performanceData = await agentCoordinatorService.getAgentPerformance(task.agentId);

        res.status(200).json({
            status: 'success',
            data: {
                task,
                agentPerformance: performanceData
            }
        });

    } catch (error) {
        Logger.error(`Error retrieving Task Status for ${req.params.taskId}:`, { error });
        next(error);
    }
};

// کۆنتڕۆڵکەرێکی تر بۆ وەرگرتنی پێگەی هەموو Agentەکان
export const getAllAgentStatuses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // وەرگرتنی پێگەی سەرجەم 70 Agentەکە بە خێرایی
        const allStatuses = await agentCoordinatorService.getStatusesOfAllAgents();
        
        res.status(200).json({
            status: 'success',
            count: allStatuses.length,
            data: allStatuses
        });
    } catch (error) {
        Logger.error('Error fetching all agent statuses:', { error });
        next(error);
    }
};
