'use client';

import React from 'react';
import { useAIConnection } from '../../services/AI_Connection_Services/AIConnectionProvider';
import { IAgentStatus } from '../../types/ProjectTypes';
import { useMediaQuery } from '../../utils/Performance_Utils/useMediaQuery';

const MassiveAgentDashboard: React.FC = () => {
    const { isConnected, agentHealth } = useAIConnection();
    const isDesktop = useMediaQuery('(min-width: 1024px)'); // lg

    if (!isConnected) {
        return (
            <div className="p-8 text-center text-red-400 bg-ai-bg-dark h-full">
                <h2 className="text-3xl font-bold mb-4">⚠️ Agent Network Disconnected</h2>
                <p>سیستەمی Agentەکان چالاک نییە. تکایە سێرڤەری باکئەند بپشکنە.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-ai-bg-dark min-h-screen">
            <h2 className="text-3xl font-bold text-ai-primary mb-6">Massive Agent Monitoring Center (70 Agents)</h2>
            <p className="text-gray-400 mb-6">چاودێری پێگەی کاتی ڕاستەقینە و خێرایی (Average Completion Time)ی Agentەکان.</p>

            {/* نیشاندەری کورتە ئامار */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="کۆی Agentەکان" value={agentHealth.length.toString()} color="text-ai-primary" />
                <StatCard label="Agentی سەرقاڵ" value={agentHealth.filter(a => a.isBusy).length.toString()} color="text-red-400" />
                <StatCard label="مامناوەندی خێرایی" value={`${(agentHealth.reduce((sum, a) => sum + a.avgCompletionTimeMs, 0) / agentHealth.length).toFixed(0)}ms`} color="text-green-400" />
                <StatCard label="ئەرکی تەواوکراو" value={agentHealth.reduce((sum, a) => sum + a.tasksCompleted, 0).toString()} color="text-yellow-400" />
            </div>

            {/* دیزاینی گۆڕاو (Responsive Rendering) */}
            {isDesktop ? renderDesktopGrid(agentHealth) : renderMobileList(agentHealth)}
        </div>
    );
};

// ------------------------------------------
// ڕووکاری لاپتۆپ (Desktop Grid View)
// ------------------------------------------
const renderDesktopGrid = (agents: IAgentStatus[]) => (
    <div className="grid grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-4">
        {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} isDesktop={true} />
        ))}
    </div>
);

// ------------------------------------------
// ڕووکاری مۆبایل (Mobile Compact List)
// ------------------------------------------
const renderMobileList = (agents: IAgentStatus[]) => (
    <div className="flex flex-col space-y-2">
        {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} isDesktop={false} />
        ))}
    </div>
);

// پێکهاتەی Agent Card (بۆ هەردوو مۆبایل و لاپتۆپ بەکاردەهێنرێت)
interface AgentCardProps {
    agent: IAgentStatus;
    isDesktop: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isDesktop }) => {
    const statusColor = agent.isBusy ? 'bg-red-700' : 'bg-green-600';
    const statusText = agent.isBusy ? 'سەرقاڵ' : 'بەتاڵ';
    const speed = agent.avgCompletionTimeMs < 1000 ? `${agent.avgCompletionTimeMs}ms` : `${(agent.avgCompletionTimeMs / 1000).toFixed(1)}s`;

    if (!isDesktop) {
        // دیزاینی مۆبایل (زۆر بچووک)
        return (
            <div className="flex items-center justify-between p-3 bg-ai-code rounded-lg border border-gray-700">
                <span className="font-semibold text-sm">{agent.id} - {agent.specialization}</span>
                <div className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${statusColor}`}>
                    {statusText} / <span className="text-yellow-300">{speed}</span>
                </div>
            </div>
        );
    }
    
    // دیزاینی لاپتۆپ (فراوان)
    return (
        <div className={`p-4 rounded-xl shadow-lg border ${agent.isBusy ? 'border-red-600 bg-red-950/30' : 'border-gray-700 bg-ai-code'}`}>
            <div className={`w-3 h-3 rounded-full inline-block mr-2 ${agent.isBusy ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-sm font-medium">{agent.id}</span>
            <p className="text-xs text-gray-400 mt-1">{agent.specialization}</p>
            
            <div className="mt-3 text-sm">
                <p className="font-bold text-white">خێرایی: <span className="text-yellow-400">{speed}</span></p>
                <p className="text-xs">ئەرک تەواوکراو: {agent.tasksCompleted}</p>
            </div>
        </div>
    );
};

// پێکهاتەی ئاماری بچووک
const StatCard: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
    <div className="p-4 bg-ai-code rounded-lg shadow-md border border-gray-700">
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
);


export default MassiveAgentDashboard;
