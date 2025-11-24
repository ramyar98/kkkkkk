import { Request, Response, NextFunction } from 'express';
import { ChatAgentService } from '../../services/Massive_Agent_Services/ChatAgentService';
import Logger from '../../utils/Logger/Logger';

const chatAgentService = new ChatAgentService();

/**
 * @function handleChat - وەرگرتنی پەیام لە بەکارهێنەر و ناردنی بۆ Chat Agent
 */
export const handleChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // وادانێ IDی پڕۆژە لە پارامەتەر یان body دێت
        const { projectId, message } = req.body; 
        const userId = (req as any).user?.id || 'ANONYMOUS_USER'; // دەبێت لە Tokenەوە وەربگیرێت

        if (!projectId || !message) {
            return res.status(400).json({ status: 'error', message: 'پێویستە Project ID و Message دیاری بکرێن.' });
        }

        const result = await chatAgentService.processChatMessage(projectId, userId, message);

        res.status(200).json({
            status: 'success',
            data: {
                aiResponse: result.response,
                action: result.actionTaken,
                taskId: result.actionTaken.includes('Assigned') ? result.actionTaken.split(' ')[2] : null
            }
        });

    } catch (error) {
        Logger.error('Error processing chat message:', { error });
        next(error);
    }
};
