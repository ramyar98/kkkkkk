import winston from 'winston';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.ms' }),
    winston.format.colorize(),
    winston.format.printf(
        (info) => `[${info.timestamp}] [${info.level.toUpperCase()}] [${info.service || 'System'}] ${info.message} ${
            info.stack ? '\n' + info.stack : '' // بۆ پیشاندانی هەڵەی تەواو
        }`
    )
);

const Logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info', // دەکرێت لەلایەن AI بگۆڕدرێت
    format: logFormat,
    defaultMeta: { service: 'AI-Core-Service' },
    transports: [
        // بۆ کونسوڵ
        new winston.transports.Console({
            format: logFormat,
        }),
        // بۆ فایلی لۆگ (بۆ ئەوەی Agentەکان بتوانن بیخوێننەوە و چاکی بکەنەوە)
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 5242880 // 5MB
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 5242880 // 5MB
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
    ]
});

// گۆڕانی لۆگ بۆ لۆگی Agentەکان لە ڕێگەی Socket.IO
(Logger as any).stream = {
    write: (message: string) => {
        // پەیوەندی بە Socket.IO بکە بۆ ناردنی لۆگ بۆ داشبۆردی Agent
        // io.emit('agentLog', { level: 'info', message: message.trim() });
        Logger.info(message.trim());
    },
};

export default Logger;
