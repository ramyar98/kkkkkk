'use client';

import React, { useState, useEffect } from 'react';
import { IProjectFile } from '../../types/ProjectTypes';
import { motion } from 'framer-motion';

interface LivePreviewEngineProps {
    projectState: any; // پاشخان دەبێت نوێکردنەوەی Flutter Web بنێرێت
    isMobile: boolean;
}

const LivePreviewEngine: React.FC<LivePreviewEngineProps> = ({ projectState, isMobile }) => {
    // دەتوانرێت Simulator Frame بگۆڕدرێت
    const [simulatorType, setSimulatorType] = useState<'iOS' | 'Android'>('Android');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // وا دانێ ئەم فەنکشنە داواکاری بۆ باکئەند دەنێرێت بۆ وەرگێڕانی کۆدەکە
    const simulateCodeRendering = () => {
        setIsRefreshing(true);
        // وا دانێ 500ms دەخایەنێت بۆ وەرگێڕان (بەهۆی خێرایی 20x)
        setTimeout(() => {
            setIsRefreshing(false);
        }, 500); 
    };

    useEffect(() => {
        // لەکاتی نوێکردنەوەی پرۆژە، سیمولەیتەکە نوێ دەکەینەوە
        simulateCodeRendering();
    }, [projectState]);

    // گونجاندنی قەبارەی مۆبایلەکە بە پێی شاشە
    const frameClasses = isMobile 
        ? "w-full h-full max-h-[80vh] mx-auto p-2"
        : "w-80 h-[90%] max-h-[700px] mx-auto mt-6 shadow-2xl rounded-[3rem] overflow-hidden border-[12px] border-black relative";
        
    const screenClasses = isMobile 
        ? "w-full h-full border border-gray-600 rounded-xl"
        : "w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative";

    return (
        <div className="h-full flex flex-col items-center justify-center p-2 bg-ai-bg-dark">
            {/* ناونیشانی سێرڤەری وەرگێڕان */}
            <div className="text-center mb-4 text-gray-400 text-sm">
                <span className="text-green-500">🟢</span> Flutter Preview Engine ({simulatorType})
                <button onClick={() => setSimulatorType(simulatorType === 'iOS' ? 'Android' : 'iOS')} className="ml-3 text-xs text-ai-primary hover:underline">
                    گۆڕینی جۆر
                </button>
            </div>

            {/* Frameی مۆبایل */}
            <motion.div 
                className={frameClasses}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* سیمولەیتکردنی دیمەنی ناو مۆبایل */}
                <div className={screenClasses} style={{ backgroundColor: '#F0F2F5' }}>
                    {isRefreshing ? (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-900/90 text-yellow-400">
                            <svg className="animate-spin h-8 w-8 text-yellow-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-sm font-semibold">AI Compiling... (500ms)</p>
                        </div>
                    ) : (
                        <FlutterSimulatedScreen simulatorType={simulatorType} projectState={projectState} />
                    )}
                </div>
                
                {/* توخمەکانی مۆبایل وەک دوگمەی هۆم */}
                {!isMobile && (
                    <>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-2 bg-black rounded-b-lg"></div> {/* Camera */}
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-10 border-4 border-gray-400 rounded-full bg-gray-700"></div> {/* Home Button */}
                    </>
                )}
                
            </motion.div>
        </div>
    );
};

// پێکهاتەی سیمولەیتکراوی ناوەوەی ئەپ (بۆ پیشاندانی داتای ساختە)
const FlutterSimulatedScreen: React.FC<{ simulatorType: 'iOS' | 'Android', projectState: any }> = ({ simulatorType }) => {
    return (
        <div className="h-full p-4 overflow-y-auto">
            {/* ناونیشانی سەرەوەی ئەپ */}
            <div className={`flex items-center p-3 text-white ${simulatorType === 'iOS' ? 'bg-blue-600' : 'bg-green-700'} rounded-t-xl`}>
                <h1 className="text-lg font-bold">AI Flutter App Demo</h1>
            </div>
            
            <div className="p-4">
                <p className="text-gray-800 font-semibold mb-2">👋 Welcome!</p>
                <p className="text-gray-600 text-sm">
                    This is the live preview of the code being written by you or the 70 Agents. 
                    The Agent system ensures this compiles in under 500ms.
                </p>
                <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                    <span className="text-ai-primary font-mono text-sm">Current File: main.dart</span>
                </div>
                
                <button className="mt-4 w-full bg-ai-secondary text-white p-3 rounded-lg font-bold hover:bg-yellow-600 transition-colors">
                    Click Me (Simulated Action)
                </button>
            </div>
        </div>
    );
};

export default LivePreviewEngine;
