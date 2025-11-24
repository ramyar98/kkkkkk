import express from 'express';
import { handleChat } from '../../controllers/DeepSeek_AI_Controllers/ChatController';
import Logger from '../../utils/Logger/Logger';

const router = express.Router();

/**
 * @route POST /api/v1/chat/message
 * @desc ناردنی پەیامی گفتوگۆ بۆ Chat Agent
 * @access Public (یان User Auth)
 */
router.post('/message', async (req, res, next) => {
    Logger.debug(`Route: Received POST request for chat message in project: ${req.body.projectId}`);
    handleChat(req, res, next);
});

export default router;
