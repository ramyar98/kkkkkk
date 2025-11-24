import express from 'express';
import { 
    submitAgentTask, 
    getTaskStatus, 
    getAllAgentStatuses 
} from '../../controllers/Massive_Agent_Controllers/AgentTaskController';
import Logger from '../../utils/Logger/Logger';

const router = express.Router();

/**
 * @route POST /api/v1/agents/task
 * @desc ناردنی ئەرکێکی نوێ بۆ Agent Coordinator.
 * @access Public (پێویستی بە User Auth هەیە لە پڕۆژەی ڕاستەقینەدا)
 */
router.post('/task', async (req, res, next) => {
    Logger.debug(`Route: Received POST request for /agents/task`);
    submitAgentTask(req, res, next);
});

/**
 * @route GET /api/v1/agents/task/:taskId
 * @desc وەرگرتنی پێگەی ئەرکێکی دیاریکراو.
 * @access Public
 */
router.get('/task/:taskId', async (req, res, next) => {
    Logger.debug(`Route: Received GET request for task status: ${req.params.taskId}`);
    getTaskStatus(req, res, next);
});

/**
 * @route GET /api/v1/agents/status/all
 * @desc وەرگرتنی پێگەی هەموو 70 Agentەکە و خێراییان (Performance).
 * @access Public (بۆ داشبۆردی چاودێری)
 */
router.get('/status/all', async (req, res, next) => {
    Logger.debug('Route: Received GET request for all agent statuses.');
    getAllAgentStatuses(req, res, next);
});

// ڕێگایەک بۆ ئەوەی Agentەکان بتوانن پێگەی خۆیان نوێ بکەنەوە (پینگ)
// گرنگە بۆ دڵنیابوون لەوەی Agentەکە ڕاناوەستێت
router.post('/agent-ping/:agentId', (req, res, next) => {
    // لۆژیکی AgentPingController لێرە بانگ دەکرێت
    // agentPingController.handlePing(req, res, next);
    res.status(200).send({ status: 'success', message: 'Ping accepted.' });
});

export default router;
