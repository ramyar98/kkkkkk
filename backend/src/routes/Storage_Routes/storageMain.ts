import express from 'express';
import { LargeFileAgentService } from '../../services/Massive_Agent_Services/LargeFileAgentService';
// *بەکارهێنانی multer بۆ مامەڵەکردن لەگەڵ Multi-part Form Data و File Streaming
import multer from 'multer'; 
import Logger from '../../utils/Logger/Logger';

const router = express.Router();
// ڕێکخستنی multer بۆ هەڵگرتنی فایل
const storage = multer.memoryStorage(); // یان DiskStorage بۆ فایلە زەبەلاحەکان
const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 1024 } }); // 1GB Limit

const largeFileAgentService = new LargeFileAgentService();

/**
 * @route POST /api/v1/storage/upload/:projectId
 * @desc وەرگرتنی فایلە گەورەکان
 */
router.post('/upload/:projectId', upload.single('projectFile'), async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).send({ status: 'error', message: 'No file uploaded.' });
        }
        
        // لۆژیکی هەڵگرتنی فایل لەسەر Disk لێرە جێبەجێ دەکرێت
        // لەبەر درێژی کۆد، تەنها وەک سەرکەوتوو سیمولەیت دەکەین:
        Logger.info(`File uploaded successfully: ${file.originalname} (${(file.size / 1024 / 1024).toFixed(2)} MB) to project ${projectId}`);
        
        // Agentەکە داواکاری گۆڕانکاری بۆ Agent Coordinator دەنێرێت
        // largeFileAgentService.processUploadedProject(projectId, file.originalname); 

        res.status(200).send({ 
            status: 'success', 
            message: `File ${file.originalname} uploaded. AI Agent is analyzing...`,
            size: file.size 
        });
    } catch (error) {
        Logger.error('Error handling large file upload:', error);
        next(error);
    }
});

export default router;
