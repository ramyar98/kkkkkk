import express from 'express';
import { handleLiveInteraction } from '../../controllers/Live_Preview_Controller/LivePreviewController';

const router = express.Router();

/**
 * @route POST /api/v1/preview/interact
 * @desc ناردنی Interaction (کلیک/نووسین) لە فرۆنتئەندەوە بۆ Live App
 */
router.post('/interact', handleLiveInteraction);

export default router;
