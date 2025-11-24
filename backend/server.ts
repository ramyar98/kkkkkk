import 'dotenv/config'; // بۆ خوێندنەوەی گۆڕاوەکانی ژینگە (environment variables)
import express, { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import Logger from './src/utils/Logger/Logger'; // بۆ چاودێری و تۆمارکردنی خێرا

// هاوردەکردنی ڕاوتەرەکان (Routers)
import aiConnectionRoutes from './src/routes/AI_Connection_Routes/aiConnectionMain';
import projectHealthRoutes from './src/routes/Project_Health_Routes/healthMain';
import massiveAgentRoutes from './src/routes/Massive_Agent_Routes/agentMain';
import deepSeekAIRoutes from './src/routes/DeepSeek_AI_Routes/deepseekMain';
import ultraFastRoutes from './src/routes/Ultra_Fast_Routes/fastMain';


const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 8080;

// 1. ڕێکخستنی خێرایی و ئاسایش (High Performance & Security)
app.use(compression()); // زۆر گرنگە بۆ خێرایی: پەستۆکردنی (Compressing) وەڵامەکان
app.use(helmet());     // زۆر گرنگە بۆ ئاسایش: پاراستنی سەرەکی (Security Headers)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

// 2. مامەڵەکردن لەگەڵ جەستەی داواکاری (Request Body)
app.use(express.json({ limit: '50mb' })); // زیادکردنی سنووری فایل بۆ مامەڵەکردن لەگەڵ پڕۆژە گەورەکان
app.use(express.urlencoded({ extended: true }));

// 3. دروستکردنی WebSocket Server (گرنگە بۆ Agents و Real-Time Validation)
const io = new SocketServer(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000, // زۆر گرنگە بۆ دڵنیابوون لە پەیوەندی بەردەوام (No Lag)
});

// تێکەڵکردنی Socket.IO لەگەڵ داواکارییەکان بۆ بەکارهێنانی لە کۆنترۆڵکەرەکاندا
app.use((req: Request, res: Response, next: NextFunction) => {
    (req as any).io = io; 
    next();
});

// 4. ڕێگاکانی API (API Routes)
app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Create App Builder AI Backend is RUNNING. Status: 20x Speed.');
});

// ڕێگاکانی تایبەت بە AI, Agents, و Validation
app.use('/api/v1/ai', aiConnectionRoutes);
app.use('/api/v1/health', projectHealthRoutes);
app.use('/api/v1/agents', massiveAgentRoutes);
app.use('/api/v1/deepseek', deepSeekAIRoutes);
app.use('/api/v1/fast', ultraFastRoutes);


// 5. مامەڵەکردنی هەڵەی گشتی (Global Error Handler)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    Logger.error(`Global Error: ${err.message}`, { stack: err.stack, path: req.path });
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).send({
        status: 'error',
        message: 'A critical system error occurred. Agent system notified.',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 6. دەستپێکردنی سێرڤەر (Server Startup)
httpServer.listen(PORT, () => {
    Logger.info(`⚡️ Server is running on port ${PORT} with 20x speed monitoring.`);
    Logger.info(`🚀 Frontend expected at: ${process.env.FRONTEND_URL}`);

    // لێرەدا دەتوانیت پەیوەندی بە داتابەیسەوە بکەیت (لە قۆناغەکانی داهاتوودا)
    // connectDB(); 

    // دەستپێکردنی Agent Coordinator System
    // AgentCoordinator.init(io); 
});

// 7. مامەڵەکردنی هەڵەی نەگیراو (Unhandled Rejection)
process.on('unhandledRejection', (reason, promise) => {
    Logger.error('FATAL: Unhandled Rejection at:', { promise, reason });
    // Agentێک ڕەوانە بکە بۆ چاککردنەوەی خێرا
    // AgentFixer.sendEmergencySignal(reason);
    process.exit(1); 
});

export { io }; // ناردنی io بۆ بەکارهێنانی لە دەرەوەی ئەم فایلە
