// src/app/dashboard/page.tsx

import MassiveAgentDashboard from '../../pages/Massive_Agent_Dashboard/MassiveAgentDashboard';

/**
 * @page MassiveAgentDashboardPage - A page to monitor the status and performance of the 70 AI Agents.
 * ئەمە پەڕەی چاودێریکردنی Agentەکانە.
 */
export default function AgentDashboardPage() {
  return (
    // Minimal layout for the dashboard to take full screen space below the navbar
    <MassiveAgentDashboard />
  );
}
