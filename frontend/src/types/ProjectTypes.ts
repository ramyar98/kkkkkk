// پێناسەی پێگەی Agentەکان (لە Backend AgentTask.ts وەرگیراوە)
export interface IAgentStatus {
    id: string;
    isBusy: boolean;
    currentTask: string | null;
    specialization: 'CodeFixer' | 'FeatureGenerator' | 'SecurityAuditor' | 'PerformanceTuner';
    avgCompletionTimeMs: number;
    tasksCompleted: number;
    lastPing: Date;
}

// پێناسەی یەک فایلی پڕۆژە
export interface IProjectFile {
    id: string;
    name: string;
    path: string;
    isDir: boolean;
    content?: string; // تەنها ئەگەر فایل بێت
    children?: IProjectFile[];
}

// پێناسەی پێکهاتەی Workspace
export type WorkspaceTab = 'EDITOR' | 'PREVIEW' | 'EXPLORER';

// پێناسەی تیمی کۆد
export type CodeTheme = 'dark' | 'light' | 'deepseek';
