import express from 'express';
import { 
    generateCodeWithDeepSeek 
} from '../../controllers/DeepSeek_AI_Controllers/DeepSeekPromptController';
import Logger from '../../utils/Logger/Logger';

const router = express.Router();

/**
 * @route POST /api/v1/deepseek/generate-code
 * @desc ناردنی Prompt بۆ DeepSeek AI بۆ دروستکردنی کۆدی فلاتەر.
 * @access Public
 */
router.post('/generate-code', async (req, res, next) => {
    Logger.debug('Route: Received POST request for DeepSeek code generation.');
    generateCodeWithDeepSeek(req, res, next);
});

/**
 * @route GET /api/v1/deepseek/usage
 * @desc وەرگرتنی زانیاری بەکارهێنانی Token و خێرایی وەڵامەکان.
 * @access Public (بۆ چاودێری)
 */
router.get('/usage', async (req, res, next) => {
    Logger.debug('Route: Received GET request for DeepSeek usage stats.');
    // لێرەدا کۆنتڕۆڵکەرێکی تایبەت بە Usage Stats بانگ دەکەین
    // usageStatsController.getUsage(req, res, next);
    res.status(200).send({ status: 'success', data: { dailyUsage: '100k Tokens', avgResponseTime: '300ms' } });
});

export default router;
