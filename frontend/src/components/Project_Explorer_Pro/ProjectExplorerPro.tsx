'use client';

import React, { useState } from 'react';
import { IProjectFile } from '../../types/ProjectTypes';
import { ChevronRight, Folder, FileText, X, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProjectExplorerProProps {
    projectTree: IProjectFile[];
    onFileSelect: (file: IProjectFile) => void;
    isOpen?: boolean; // تەنها بۆ لاپتۆپ
    onToggle?: () => void; // تەنها بۆ لاپتۆپ
    isMobile: boolean; // بۆ جیاکردنەوەی شێواز
    onClose?: () => void; // تەنها بۆ مۆبایل
}

const ProjectExplorerPro: React.FC<ProjectExplorerProProps> = ({ 
    projectTree, 
    onFileSelect, 
    isOpen = true, 
    onToggle, 
    isMobile,
    onClose
}) => {
    // ئەگەر لە لاپتۆپدا داخراو بێت، تەنها دوگمەیەکە پیشان دەدرێت
    if (!isMobile && !isOpen) {
        return (
            <div className="p-2 flex justify-center items-start pt-4 cursor-pointer hover:bg-gray-700 h-full" onClick={onToggle}>
                <Menu className="w-5 h-5 text-gray-400" />
            </div>
        );
    }
    
    return (
        <div className={`text-white overflow-y-auto h-full ${isMobile ? 'pt-4' : ''}`}>
            {/* سەرەکی (Header) - جیاواز بۆ مۆبایل و لاپتۆپ */}
            <header className="p-3 border-b border-gray-700 flex justify-between items-center bg-ai-code">
                <h3 className={`font-bold ${isMobile ? 'text-lg' : 'text-sm'}`}>
                    📁 Flutter Project (20X)
                </h3>
                {!isMobile && onToggle && (
                    <button onClick={onToggle} className="text-gray-400 hover:text-ai-primary transition-colors p-1">
                        <ChevronRight className={`w-4 h-4 transform transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} />
                    </button>
                )}
                {isMobile && onClose && (
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <X className="w-6 h-6" />
                    </button>
                )}
            </header>

            {/* درەختی فایل */}
            <div className={`p-2 ${isMobile ? 'text-base' : 'text-sm'}`}>
                {projectTree.map(item => (
                    <FileTreeItem key={item.id} file={item} onFileSelect={onFileSelect} depth={0} />
                ))}
            </div>
        </div>
    );
};

// پێکهاتەی نووسینەوە (Recursive Component)
interface FileTreeItemProps {
    file: IProjectFile;
    onFileSelect: (file: IProjectFile) => void;
    depth: number;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ file, onFileSelect, depth }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const paddingLeft = `${depth * 1.5 + 0.5}rem`;

    if (file.isDir) {
        return (
            <div>
                <motion.div 
                    className="flex items-center cursor-pointer hover:bg-gray-700/50 p-1 rounded transition-colors"
                    style={{ paddingLeft }}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <ChevronRight className={`w-4 h-4 mr-1 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    <Folder className="w-4 h-4 mr-2 text-yellow-500" />
                    <span>{file.name}</span>
                </motion.div>
                <motion.div
                    initial={false}
                    animate={{ height: isExpanded ? 'auto' : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                >
                    {file.children && file.children.map(child => (
                        <FileTreeItem key={child.id} file={child} onFileSelect={onFileSelect} depth={depth + 1} />
                    ))}
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div 
            className="flex items-center cursor-pointer hover:bg-gray-700/50 p-1 rounded transition-colors text-gray-300 hover:text-white"
            style={{ paddingLeft }}
            onClick={() => onFileSelect(file)}
            whileHover={{ scale: 1.02 }}
        >
            <FileText className="w-4 h-4 mr-2 text-ai-primary" />
            <span className="truncate">{file.name}</span>
        </motion.div>
    );
};


export default ProjectExplorerPro;
