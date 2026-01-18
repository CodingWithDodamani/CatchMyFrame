
import React, { useState } from 'react';
import { CaptureQuality } from '../types';
import { DiamondIcon, TagIcon, TimerIcon } from './icons';

export type FilenameFormat = 'timestamp' | 'sequence' | 'videoTime';

export interface AppSettings {
    quality: CaptureQuality;
    filenameFormat: FilenameFormat;
    fps: number;
    dpi: number;
    exportFormat: 'jpeg' | 'png' | 'webp';
    sceneDetectSensitivity: number;
    aiSceneDetectSensitivity: number;
}

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onSettingsChange: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
    if (!isOpen) return null;

    type Tab = 'quality' | 'naming' | 'automation';
    const [activeTab, setActiveTab] = useState<Tab>('quality');

    const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSettingsChange({ ...settings, quality: e.target.value as CaptureQuality });
    };

    const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSettingsChange({ ...settings, filenameFormat: e.target.value as FilenameFormat });
    };

    const handleFpsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFps = Math.max(1, Math.min(30, Number(e.target.value))); // Clamp between 1 and 30
        onSettingsChange({ ...settings, fps: newFps });
    };

    const handleDpiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSettingsChange({ ...settings, dpi: Number(e.target.value) });
    };

    const formatDescriptions: Record<FilenameFormat, string> = {
        timestamp: "e.g., frame_1678886400000.png",
        sequence: "e.g., video-name_frame_0001.png",
        videoTime: "e.g., video-name_00-05-32-123.png",
    };

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'quality', label: 'Output', icon: <DiamondIcon className="w-4 h-4" /> },
        { id: 'naming', label: 'Naming', icon: <TagIcon className="w-4 h-4" /> },
        { id: 'automation', label: 'Auto', icon: <TimerIcon className="w-4 h-4" /> },
    ];

    const dpiOptions = [72, 96, 150, 300, 600, 1200, 2400];

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] transition-opacity animate-fade-in"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-[#0f1115] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg m-4 flex flex-col transform transition-all overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 bg-white/5">
                    <h2 className="text-xl font-bold text-white tracking-tight">Studio Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1.5 bg-black/20 border-b border-white/5">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-8 min-h-[320px]">
                    {activeTab === 'quality' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Image Format</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="relative flex flex-col gap-2 p-4 bg-gray-900 rounded-xl cursor-pointer border-2 transition-all duration-200 hover:bg-gray-800 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-900/10 has-[:checked]:shadow-lg border-transparent">
                                        <input
                                            type="radio"
                                            name="quality"
                                            value="high"
                                            checked={settings.quality === 'high'}
                                            onChange={handleQualityChange}
                                            className="absolute opacity-0"
                                        />
                                        <span className="font-bold text-white text-lg">High Quality</span>
                                        <span className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded w-fit">PNG Lossless</span>
                                    </label>
                                    <label className="relative flex flex-col gap-2 p-4 bg-gray-900 rounded-xl cursor-pointer border-2 transition-all duration-200 hover:bg-gray-800 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-900/10 has-[:checked]:shadow-lg border-transparent">
                                        <input
                                            type="radio"
                                            name="quality"
                                            value="low"
                                            checked={settings.quality === 'low'}
                                            onChange={handleQualityChange}
                                            className="absolute opacity-0"
                                        />
                                        <span className="font-bold text-white text-lg">Optimized</span>
                                        <span className="text-xs font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded w-fit">JPEG (92%)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Metadata Density (DPI)</h3>
                                </div>
                                <div className="relative">
                                    <select
                                        value={settings.dpi}
                                        onChange={handleDpiChange}
                                        className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer hover:bg-gray-800 transition-colors"
                                    >
                                        {dpiOptions.map(dpi => (
                                            <option key={dpi} value={dpi}>{dpi} DPI {dpi >= 600 ? '(High)' : dpi >= 300 ? '(Print Standard)' : '(Screen)'}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                        <ChevronDownIcon className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'naming' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">File Naming Convention</h3>
                            <div className="relative">
                                <select
                                    value={settings.filenameFormat}
                                    onChange={handleFormatChange}
                                    className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer hover:bg-gray-800 transition-colors"
                                >
                                    <option value="timestamp">Timestamp ID (Unique)</option>
                                    <option value="sequence">Sequence (001, 002...)</option>
                                    <option value="videoTime">Video Timestamp (MM-SS)</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                    <ChevronDownIcon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="p-4 bg-black/30 rounded-xl border border-white/5">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Example Output</p>
                                <p className="font-mono text-sm text-indigo-400">{formatDescriptions[settings.filenameFormat]}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'automation' && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Interval Capture Rate</h3>
                            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-3xl font-bold text-white">{settings.fps} <span className="text-sm text-gray-500 font-normal">FPS</span></span>
                                    <span className="text-xs font-mono text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">{(1000 / settings.fps).toFixed(0)}ms Interval</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    step="1"
                                    value={settings.fps}
                                    onChange={handleFpsChange}
                                    className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
                                />
                                <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500 uppercase">
                                    <span>1 FPS</span>
                                    <span>30 FPS</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Defines the checking frequency for Interval, Range, and AI detection modes. Higher FPS increases CPU usage.
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 transition-all active:scale-95"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper Icon for this file
const ChevronDownIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

export default SettingsModal;
