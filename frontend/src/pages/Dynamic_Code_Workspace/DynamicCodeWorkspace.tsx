'use client';

import React, { useState, useCallback } from 'react';
import { WorkspaceTab, IProjectFile } from '../../types/ProjectTypes';
import ProjectExplorerPro from '../../components/Project_Explorer_Pro/ProjectExplorerPro';
import DynamicCodeEditor from '../../components/Dynamic_Code_Generator/DynamicCodeEditor';
import LivePreviewEngine from '../../components/Live_Preview_Engine/LivePreviewEngine';
import AgentCommandBar from '../../components/Massive_Agent_System/AgentCommandBar';
import { useMediaQuery } from '../../utils/Performance_Utils/useMediaQuery'; // بۆ دۆزینەوەی جۆری شاشە

// داتای درەختی فایلی نموونەیی
const initialProjectTree: IProjectFile[] = [
    { id: '1', name: 'lib', path: 'lib', isDir: true, children: [
        { id: '1-1', name: 'main.dart', path: 'lib/main.dart', isDir: false, content: '// Flutter App Entry Point\nimport \'package:flutter/material.dart\';\n...' },
        { id: '1-2', name: 'widgets', path: 'lib/widgets', isDir: true, children: [] },
    ]},
    { id: '2', name: 'pubspec.yaml', path: 'pubspec.yaml', isDir: false, content: 'name: my_flutter_app\ndependencies:\n  flutter:\n    sdk: flutter\n' },
];

const DynamicCodeWorkspace: React.FC = () => {
    // بۆ مۆبایل، پێویستە Active Tab دیاری بکەین
    const [activeTab, setActiveTab] = useState<WorkspaceTab>('EDITOR');
    // بۆ لاپتۆپ، پێویستە Project Explorer بکشێندرێتەوە یان بکرێتەوە
    const [isExplorerOpen, setIsExplorerOpen] = useState(true);
    const [currentFile, setCurrentFile] = useState<IProjectFile | null>(initialProjectTree[0].children![0]);

    // Hook بۆ دۆزینەوەی شاشەی گەورە (لاپتۆپ)
    const isDesktop = useMediaQuery('(min-width: 1024px)'); // lg:1024px لە tailwind

    const handleFileSelect = useCallback((file: IProjectFile) => {
        if (!file.isDir) {
            setCurrentFile(file);
        }
        // لە مۆبایلدا، دوای هەڵبژاردنی فایل، Project Explorer دادەخرێت
        if (!isDesktop) {
            setActiveTab('EDITOR');
        }
    }, [isDesktop]);

    const handleEditorChange = useCallback((newContent: string) => {
        if (currentFile) {
            // ناردنی نوێکردنەوە بۆ باکئەند (AI Validation)
            // apiService.updateFileContent(currentFile.path, newContent);
            
            // نوێکردنەوەی ناوخۆیی بۆ پیشاندانی خێرا
            setCurrentFile({ ...currentFile, content: newContent });
        }
    }, [currentFile]);

    // ------------------------------------------
    // 1. ڕووکاری مۆبایل (Mobile/Small Screen View)
    // ------------------------------------------
    const renderMobileLayout = () => (
        <div className="flex flex-col h-full">
            {/* گۆڕانکاریی تابەکان بۆ مۆبایل */}
            <div className="flex justify-around bg-ai-code border-b border-gray-700">
                <MobileTabButton tab="EDITOR" activeTab={activeTab} setActiveTab={setActiveTab} label="✏️ Code Editor" />
                <MobileTabButton tab="PREVIEW" activeTab={activeTab} setActiveTab={setActiveTab} label="📱 Live Preview" />
                <button 
                    onClick={() => setIsExplorerOpen(true)}
                    className="p-3 text-sm flex-1 hover:bg-gray-700 transition-colors"
                >
                    📁 Explorer
                </button>
            </div>
            
            {/* Project Explorer - وەک سایدبارێکی شاردراوە */}
            <div className={`fixed top-0 left-0 h-full w-3/4 bg-ai-code z-40 transform transition-transform duration-300 ${isExplorerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <ProjectExplorerPro 
                    projectTree={initialProjectTree} 
                    onFileSelect={handleFileSelect} 
                    onClose={() => setIsExplorerOpen(false)}
                    isMobile={true}
                />
            </div>
            {isExplorerOpen && <div className="fixed inset-0 bg-black opacity-50 z-30" onClick={() => setIsExplorerOpen(false)}></div>}

            <div className="flex-1 overflow-hidden">
                {activeTab === 'EDITOR' && currentFile && (
                    <DynamicCodeEditor 
                        file={currentFile} 
                        onChange={handleEditorChange} 
                        theme={'deepseek'} 
                        isMobile={true} 
                    />
                )}
                {activeTab === 'PREVIEW' && (
                    <LivePreviewEngine 
                        projectState={{}} // داتای کاتی ڕاستەقینەی فلاتەر
                        isMobile={true} 
                    />
                )}
            </div>
        </div>
    );

    // ------------------------------------------
    // 2. ڕووکاری لاپتۆپ (Desktop/Large Screen View)
    // ------------------------------------------
    const renderDesktopLayout = () => (
        <div className="flex h-full overflow-hidden">
            {/* Project Explorer Pro - ستوونی یەکەم (گۆڕاو) */}
            <div className={`transition-all duration-300 bg-ai-code border-r border-gray-700 overflow-y-auto ${isExplorerOpen ? 'w-64 min-w-64' : 'w-10 min-w-10'}`}>
                <ProjectExplorerPro 
                    projectTree={initialProjectTree} 
                    onFileSelect={handleFileSelect} 
                    onToggle={() => setIsExplorerOpen(!isExplorerOpen)}
                    isOpen={isExplorerOpen}
                    isMobile={false}
                />
            </div>

            {/* Dynamic Code Editor - ستوونی ناوەند */}
            <div className="flex-1 overflow-hidden">
                <DynamicCodeEditor 
                    file={currentFile} 
                    onChange={handleEditorChange} 
                    theme={'deepseek'} 
                    isMobile={false} 
                />
                <AgentCommandBar currentFilePath={currentFile?.path} />
            </div>

            {/* Live Preview Engine - ستوونی سێیەم */}
            <div className="w-96 min-w-96 border-l border-gray-700 bg-ai-bg-dark flex flex-col">
                 <LivePreviewEngine 
                    projectState={{}} 
                    isMobile={false} 
                 />
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-60px)] flex flex-col"> {/* گونجاندن لەگەڵ هەبوونی NavBar */}
             {isDesktop ? renderDesktopLayout() : renderMobileLayout()}
        </div>
    );
};

// پێکهاتەی یارمەتیدەر بۆ دوگمەکانی مۆبایل
interface MobileTabButtonProps {
    tab: WorkspaceTab;
    activeTab: WorkspaceTab;
    setActiveTab: (tab: WorkspaceTab) => void;
    label: string;
}

const MobileTabButton: React.FC<MobileTabButtonProps> = ({ tab, activeTab, setActiveTab, label }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`p-3 text-sm flex-1 transition-colors ${
            activeTab === tab ? 'bg-ai-primary text-white font-bold' : 'hover:bg-gray-700'
        }`}
    >
        {label}
    </button>
);

export default DynamicCodeWorkspace;
