'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { IAgentStatus } from '../../types/AgentTypes'; // پێناسەی Agentەکان

// پێناسەی پێکهاتەی Context
interface IAIConnectionContext {
    isConnected: boolean;
    agentHealth: IAgentStatus[];
    latestTaskUpdate: any; 
    aiLatency: number;
    // فەنکشن بۆ ناردنی فەرمان بۆ Agentەکان بە Socket
    sendAgentCommand: (command: string, payload: any) => void;
}

const AIConnectionContext = createContext<IAIConnectionContext | undefined>(undefined);

// URLی باکئەندمان
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

let socket: Socket | null = null;

export default function AIConnectionProvider({ children }: { children: ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);
    const [agentHealth, setAgentHealth] = useState<IAgentStatus[]>([]);
    const [latestTaskUpdate, setLatestTaskUpdate] = useState(null);
    const [aiLatency, setAiLatency] = useState(0);

    useEffect(() => {
        // دامەزراندنی پەیوەندی Socket
        socket = io(SOCKET_SERVER_URL, {
            transports: ['websocket'],
            autoConnect: true,
            reconnectionAttempts: 5 // هەوڵدانەوەی پەیوەندی
        });

        // 1. مامەڵەکردن لەگەڵ پێگەی پەیوەندی
        socket.on('connect', () => {
            setIsConnected(true);
            console.log('Socket Connected to Backend!');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Socket Disconnected from Backend.');
        });

        // 2. وەرگرتنی پێگەی Agents (Real-Time Update)
        socket.on('agentHealthUpdate', (data: IAgentStatus[]) => {
            setAgentHealth(data);
            // زانیاری لەسەر خێرایی مامناوەندی agents
            const totalAvgTime = data.reduce((sum, agent) => sum + agent.avgCompletionTimeMs, 0) / data.length;
            setAiLatency(Math.round(totalAvgTime));
        });

        // 3. وەرگرتنی نوێکردنەوەی ئەرکەکان
        socket.on('taskUpdate', (data) => {
            setLatestTaskUpdate(data);
            console.log('Task Update:', data.taskId, data.status);
        });
        
        socket.on('taskCompletion', (data) => {
            setLatestTaskUpdate(data);
            console.log(`Task ${data.taskId} COMPLETED by ${data.agent} in ${data.duration}ms! (20x Speed!)`);
        });

        // 4. Clean-up لەکاتی جیاکردنەوەی پێکهاتەکە
        return () => {
            socket?.off('connect');
            socket?.off('disconnect');
            socket?.off('agentHealthUpdate');
            socket?.off('taskUpdate');
            socket?.off('taskCompletion');
            socket?.close();
        };
    }, []);

    const sendAgentCommand = (command: string, payload: any) => {
        if (socket && isConnected) {
            socket.emit(command, payload);
        } else {
            console.error('Cannot send command. Socket not connected.');
        }
    };

    return (
        <AIConnectionContext.Provider value={{ isConnected, agentHealth, latestTaskUpdate, aiLatency, sendAgentCommand }}>
            {children}
        </AIConnectionContext.Provider>
    );
}

// Custom Hook بۆ بەکارهێنانی ئاسانی context لە پێکهاتەکانی تردا
export const useAIConnection = () => {
    const context = useContext(AIConnectionContext);
    if (context === undefined) {
        throw new Error('useAIConnection must be used within an AIConnectionProvider');
    }
    return context;
};

// پێناسەی جۆر بۆ Agentەکان لە فۆڵدەری types (کە دواتر دروستی دەکەین)
// ئەمە بۆ دڵنیابوون لەوەیە کە کۆدەکەمان Type-Safe بێت
// لە ئێستادا وەک any مامەڵەی لەگەڵ دەکەین تا فایلی types دروست دەکەین
