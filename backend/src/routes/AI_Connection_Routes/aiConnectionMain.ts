import express from 'express';
import Logger from '../../utils/Logger/Logger';

const router = express.Router();

// لێرەدا ڕێگاکانی پەیوەندی و چاودێری سەرەکی AI دادەنێین
router.get('/status', (req, res) => {
    Logger.debug('Route: AI Connection status check.');
    res.status(200).json({ status: 'connected', latency: '15ms', model: 'DeepSeek-V2' });
});

export default router;
