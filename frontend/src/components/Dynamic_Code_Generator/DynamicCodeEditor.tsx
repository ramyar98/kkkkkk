'use client';

import React, { useRef, useState, useEffect } from 'react';
import { IProjectFile, CodeTheme } from '../../types/ProjectTypes';
import Editor, { EditorDidMount } from 'react-monaco-editor';
import { useAIConnection } from '../../services/AI_Connection_Services/AIConnectionProvider';

interface DynamicCodeEditorProps {
    file: IProjectFile | null;
    onChange: (newContent: string) => void;
    theme: CodeTheme;
    isMobile: boolean;
}

const DynamicCodeEditor: React.FC<DynamicCodeEditorProps> = ({ file, onChange, theme, isMobile }) => {
    const editorRef = useRef<any>(null);
    const { aiLatency } = useAIConnection();
    const [editorHeight, setEditorHeight] = useState('calc(100vh - 120px)'); // بەرزی بنەڕەتی

    // گونجاندنی بەرزی ئێدیتۆرەکە بە پێی شاشە
    useEffect(() => {
        // بۆ مۆبایل یان شاشە بچووکەکان (کە تابی تێدایە)
        if (isMobile) {
            setEditorHeight('calc(100vh - 120px)'); 
        } else {
            // بۆ لاپتۆپ (بە پشتبەستن بە هەبوونی Command Bar)
            setEditorHeight('calc(100vh - 160px)'); 
        }
    }, [isMobile]);

    // پێناسەی زمان و themeی Monaco
    const editorOptions = {
        selectOnLineNumbers: true,
        renderLineHighlight: 'all',
        automaticLayout: true, // گرنگە بۆ گۆڕاوی
        minimap: { enabled: !isMobile }, // نەخشەی بچووک لە مۆبایلدا دەشاردرێتەوە
        fontSize: isMobile ? 12 : 14,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
    };

    const handleEditorDidMount: EditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        
        // ڕێکخستنی Themeێکی تایبەت بە DeepSeek/Dark
        monaco.editor.defineTheme('deepseek', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6A9955' }, // سەوز
                { token: 'keyword', foreground: '569CD6' }, // شین
                { token: 'string', foreground: 'CE9178' }, // پرتەقاڵی کاڵ
                { token: 'type', foreground: '4EC9B0' } // فلاتەر
            ],
            colors: {
                'editor.foreground': '#D4D4D4',
                'editor.background': '#1E1E1E', 
                'editor.lineHighlightBackground': '#3C3C3C'
            }
        });
        monaco.editor.setTheme(theme);

        // زیادکردنی لۆژیکی یارمەتی AI (Auto-Completion)
        monaco.languages.registerCompletionItemProvider('dart', {
            provideCompletionItems: (model, position) => {
                const suggestions = [
                    {
                        label: 'AgentFixCode',
                        kind: monaco.languages.CompletionItemKind.Function,
                        documentation: 'فەرمانی چاککردنی کۆد بە Agentی AI (Latency: ' + aiLatency + 'ms)',
                        insertText: `// @AgentFix: [وەسفی کێشەکە لێرە بنووسە]`,
                    },
                    {
                        label: 'AgentSuggestFeature',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        documentation: 'فەرمانی زیادکردنی فیچەرێکی نوێ بە Agentی AI',
                        insertText: `// @AgentFeature: [وەسفی فیچەرەکە لێرە بنووسە]`,
                    },
                ];
                return { suggestions: suggestions };
            }
        });
    };

    if (!file) {
        return (
            <div className={`flex items-center justify-center ${isMobile ? 'h-[40vh]' : 'h-full'} bg-ai-code`}>
                <p className="text-gray-500">تکایە فایلێک لە Project Explorer هەڵبژێرە.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* ناوی فایل و ئاگادارکەرەوەی AI */}
            <div className="flex justify-between items-center p-2 bg-ai-bg-dark border-b border-gray-700">
                <span className="text-sm font-semibold text-ai-secondary">{file.name}</span>
                <span className={`text-xs ${aiLatency < 400 ? 'text-green-400' : 'text-yellow-400'}`}>
                    ⚡ AI Latency: {aiLatency}ms
                </span>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
                <Editor
                    width="100%"
                    height={editorHeight}
                    language="dart"
                    theme={theme}
                    value={file.content}
                    options={editorOptions}
                    onChange={onChange}
                    editorDidMount={handleEditorDidMount}
                />
            </div>
        </div>
    );
};

export default DynamicCodeEditor;
