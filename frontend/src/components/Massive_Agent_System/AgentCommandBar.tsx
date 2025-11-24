'use client';

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useAIConnection } from '../../services/AI_Connection_Services/AIConnectionProvider';
import { AgentTaskModel } from '@/backend/src/models/Massive_Agent_Models/AgentTask'; // هاوردەکردنی جۆرەکان بۆ دڵنیایی

interface AgentCommandBarProps {
    currentFilePath: string | undefined;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

const AgentCommandBar: React.FC<AgentCommandBarProps> = ({ currentFilePath }) => {
    const { isConnected, aiLatency, latestTaskUpdate } = useAIConnection();
    const [commandPrompt, setCommandPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastTaskId, setLastTaskId] = useState<string | null>(null);

    const handleSubmitCommand = useCallback(async () => {
        if (!commandPrompt || !currentFilePath || isLoading || !isConnected) {
            alert('تکایە فەرمانێک بنووسە و دڵنیابە لە پەیوەندی.');
            return;
        }

        setIsLoading(true);
        setLastTaskId(null);

        try {
            // ناردنی داواکاری بۆ Agent Coordinator Controller
            const response = await axios.post(`${API_BASE_URL}/api/v1/agents/task`, {
                taskType: 'CODE_FIX', // بە پێی Promptەکە دەگۆڕدرێت
                projectPath: currentFilePath,
                description: commandPrompt,
                priority: 'HIGH'
            });

            if (response.data.status === 'success') {
                const taskId = response.data.taskId;
                setLastTaskId(taskId);
                setCommandPrompt('');
                console.log(`Agent Task successfully submitted: ${taskId}`);

                // نیشاندانی تابلۆی کاتی ڕاستەقینە
                // لێرەدا دەکرێت modal یان notificationێکی خێرا دەربکەوێت.
            }

        } catch (error) {
            console.error('Error sending agent command:', error);
            alert('کێشە لە ناردنی فەرمانی Agent ڕوویدا.');
        } finally {
            setIsLoading(false);
        }
    }, [commandPrompt, currentFilePath, isLoading, isConnected]);

    const statusMessage = lastTaskId 
        ? `🔥 ئەرکی ژمارە ${lastTaskId.substring(0, 8)} نێردرا،Agentەکە: ${latestTaskUpdate?.agent || '...'}، پێگە: ${latestTaskUpdate?.status || 'ASSIGNED'} `
        : isConnected 
            ? `AI بەردەستە، دواکەوتنی مامناوەندی Agent: ${aiLatency}ms. خێرایی 20X ئامادەیە.`
            : '⚠️ پەیوەندی بە Agent Coordinatorەوە پچڕاوە.';
            
    return (
        <div className="p-3 border-t border-gray-700 bg-ai-code text-white">
            <h3 className="text-sm font-semibold mb-2 text-ai-secondary">Agent Command Line (DeepSeek Powered)</h3>
            <div className="flex space-x-2">
                <input
                    type="text"
                    placeholder="بۆ نموونە: 'ئەم هەڵەیە چاک بکە' یان 'Widgetی تۆمارکردن دروست بکە'..."
                    value={commandPrompt}
                    onChange={(e) => setCommandPrompt(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSubmitCommand();
                    }}
                    disabled={!isConnected || isLoading}
                    className="flex-1 p-2 bg-ai-bg-dark border border-gray-600 rounded-lg focus:ring-ai-primary focus:border-ai-primary outline-none text-sm"
                />
                <button
                    onClick={handleSubmitCommand}
                    disabled={!isConnected || isLoading || !commandPrompt}
                    className={`px-4 py-2 rounded-lg font-bold transition-colors text-sm flex items-center ${
                        isConnected && commandPrompt ? 'bg-ai-primary hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed'
                    }`}
                >
                    {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        'ناردنی فەرمان'
                    )}
                </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">{statusMessage}</p>
        </div>
    );
};

export default AgentCommandBar;
