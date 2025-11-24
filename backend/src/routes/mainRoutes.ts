// flutter_advanced_creator/backend/src/routes/mainRoutes.ts (سەرەکی)

import express from 'express';
// ... هاوردەکردنی ڕێگاکانی پێشوو
import largeFileRoutes from './Storage_Routes/storageMain'; // ڕێگای نوێ بۆ فایلە گەورەکان
import livePreviewRoutes from './Live_Preview_Routes/livePreviewMain'; // ڕێگای نوێ بۆ Live Interaction

const router = express.Router();

// ... Agent Routes
// ... DeepSeek Routes

// [NEW] ڕێگای 1GB File Upload و Storage
router.use('/storage', largeFileRoutes);

// [NEW] ڕێگای Live App Interaction
router.use('/preview', livePreviewRoutes);

export default router;
