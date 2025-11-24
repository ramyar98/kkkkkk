'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAIConnection } from '../../services/AI_Connection_Services/AIConnectionProvider';
import { MessageSquare, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// پێناسەی جۆری پەیام
interface ChatMessage {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    action?: string; // بۆ نیشاندانی ئەوەی Agent چالاک کراوە
}

interface AIChatInterfaceProps {
    projectId: string; // IDی پڕۆژەی ئێستا بۆ پاراستنی Memory
    isMobile: boolean; // بۆ گونجاندنی دیزاین
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ projectId, isMobile }) => {
    const { isConnected, latestTaskUpdate } = useAIConnection();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // سکرۆڵکردن بۆ کۆتا پەیام
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    // نوێکردنەوەی AI لەسەر بنەمای TaskUpdateی Socket.IO
    useEffect(() => {
        if (latestTaskUpdate && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.action && lastMessage.action.includes('Assigned')) {
                // نوێکردنەوەی پەیامی کۆتایی کە ئەرک نێردراوە
                 setMessages(prev => prev.map(msg => 
                    msg.id === lastMessage.id
                        ? { ...msg, text: `${msg.text} (Agent ${latestTaskUpdate.agent} - ${latestTaskUpdate.status})`, action: latestTaskUpdate.status }
                        : msg
                ));
            }
        }
    }, [latestTaskUpdate]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: Date.now(), sender: 'user', text: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/v1/chat/message`, { projectId, message: input.trim() });
            const data = response.data.data;

            const aiMessage: ChatMessage = {
                id: Date.now() + 1,
                sender: 'ai',
                text: data.aiResponse,
                action: data.action
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error('Chat API Error:', error);
            const errorMessage: ChatMessage = { id: Date.now() + 1, sender: 'ai', text: 'داوای لێبوردن دەکەین، کێشە لە پەیوەندی بە Chat Agent ڕوویدا.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const containerHeight = isMobile ? 'h-[50vh]' : 'h-full';

    return (
        <div className={`flex flex-col bg-ai-code border-l border-gray-700 ${isMobile ? 'w-full' : 'w-96 min-w-96'} ${containerHeight}`}>
            <header className="p-3 border-b border-gray-700 text-ai-secondary font-bold flex items-center">
                <Bot className="w-5 h-5 mr-2" />
                Chat AI (پشتیوانی بەردەوام)
            </header>
            
            {/* شوێنی پەیامەکان */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-ai-primary" />
                        <p>دەست بکە بە گفتوگۆ. داوای گۆڕانکاری کۆد بکە!</p>
                    </div>
                )}
                
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`p-3 max-w-xs md:max-w-md rounded-xl shadow-lg ${
                                msg.sender === 'user' ? 'bg-ai-primary text-white rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none'
                            }`}>
                                <div className="flex items-center mb-1">
                                    {msg.sender === 'user' ? <User className="w-4 h-4 mr-1" /> : <Bot className="w-4 h-4 mr-1 text-ai-secondary" />}
                                    <span className="font-bold text-sm">{msg.sender === 'user' ? 'تۆ' : 'Chat Agent'}</span>
                                </div>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                {msg.action && msg.action !== 'None' && (
                                    <p className="text-xs mt-1 italic text-yellow-300">
                                        {msg.action.includes('Assigned') ? `🔥 ${msg.action}` : `✅ ${msg.action}`}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="p-3 bg-gray-700 rounded-xl rounded-bl-none">
                            <Loader2 className="w-4 h-4 animate-spin text-ai-secondary inline-block mr-2" />
                            <span className="text-sm">Agent خەریکی بیرکردنەوەیە...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* شوێنی ناردنی پەیام */}
            <div className="p-3 border-t border-gray-700">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleSend(); }}
                        placeholder={isConnected ? 'پەیامێکت بنێرە بۆ Agent...' : 'پەیوەندی نییە...'}
                        disabled={!isConnected || isLoading}
                        className="flex-1 p-3 bg-ai-bg-dark border border-gray-600 rounded-lg focus:ring-ai-primary focus:border-ai-primary outline-none text-sm text-white"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!isConnected || isLoading || !input.trim()}
                        className={`p-3 rounded-lg transition-colors ${
                            isConnected && input.trim() ? 'bg-ai-primary hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <Send className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChatInterface;
