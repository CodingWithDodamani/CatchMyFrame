import React, { useState, useEffect } from 'react';
import { CapturedFrame, FilterConfig, SharpeningLevel } from '../../types';
import { processImage, injectDpi } from '../../utils';
import { SpinnerIcon, AdjustmentsIcon } from '../icons';
import { ProSlider } from './ProSlider';

interface PreviewEditorModalProps {
    frame: CapturedFrame | null;
    onClose: () => void;
    initialDpi: number | null;
    initialFilters: FilterConfig;
    onUpdateFrame: (id: string, filters: FilterConfig) => void;
    onUpdateAllFrames: (filters: FilterConfig) => void;
}

const sharpeningLevels: SharpeningLevel[] = ['off', 'low', 'medium', 'high'];
const dpiOptions = [72, 96, 150, 300, 600, 1200, 2400];

export const PreviewEditorModal: React.FC<PreviewEditorModalProps> = ({ frame, onClose, initialDpi, initialFilters, onUpdateFrame, onUpdateAllFrames }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [filters, setFilters] = useState<FilterConfig>(initialFilters);
    const [activeTab, setActiveTab] = useState<'detail' | 'light' | 'effects'>('light');

    useEffect(() => {
        if (filters.dpi === undefined && initialDpi !== null) setFilters(prev => ({ ...prev, dpi: initialDpi }));
    }, [initialDpi]);

    useEffect(() => {
        if (!frame) return;
        let isCancelled = false;
        const generatePreview = async () => {
            setIsProcessing(true);
            try {
                const processed = await processImage(frame.dataUrl, filters);
                if (!isCancelled) setPreviewUrl(processed);
            } catch (e) { console.error(e); } finally { if (!isCancelled) setIsProcessing(false); }
        };
        const timer = setTimeout(generatePreview, 50);
        return () => { isCancelled = true; clearTimeout(timer); };
    }, [frame, filters]);

    const handleDownload = async () => {
        if (!frame || !previewUrl) return;
        let finalDataUrl = previewUrl;
        const downloadDpi = filters.dpi || initialDpi;
        if (downloadDpi) finalDataUrl = injectDpi(finalDataUrl, downloadDpi);
        const link = document.createElement('a');
        link.href = finalDataUrl;
        link.download = frame.filename.replace(/(\.[\w\d_-]+)$/i, `_edited$1`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!frame) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fade-in" onClick={onClose}>
            <div className="theme-card theme-border border rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col md:flex-row overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Image Canvas */}
                <div className="flex-grow theme-bg-secondary relative flex items-center justify-center p-8 overflow-hidden group">
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-500/10 via-transparent to-transparent"></div>
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg ring-1 ring-white/5 transition-transform duration-500"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3 theme-text-muted">
                            <SpinnerIcon className="w-8 h-8 animate-spin" />
                            <span className="text-xs font-mono uppercase tracking-widest">Rendering...</span>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-96 theme-bg border-l theme-border flex flex-col">
                    <div className="p-6 border-b theme-border flex justify-between items-center theme-bg-card">
                        <h3 className="font-bold theme-text flex items-center gap-2"><AdjustmentsIcon className="w-5 h-5 text-indigo-500" /> Editor</h3>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full theme-bg-secondary hover:theme-bg-elevated theme-text-muted hover:theme-text transition-colors">&times;</button>
                    </div>

                    <div className="flex p-1.5 gap-1 m-4 theme-bg-secondary rounded-xl border theme-border">
                        {['light', 'detail', 'effects'].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab ? 'bg-[var(--brand-primary)] text-[var(--text-inverse)] shadow-lg' : 'theme-text-muted hover:theme-text hover:theme-bg-elevated'}`}>{tab}</button>
                        ))}
                    </div>

                    <div className="px-6 py-4 space-y-8 flex-grow overflow-y-auto custom-scrollbar">
                        {activeTab === 'light' && (
                            <div className="space-y-6 animate-fade-in">
                                <ProSlider label="Brightness" value={filters.brightness} min={0} max={200} defaultValue={100} onChange={v => setFilters({ ...filters, brightness: v })} unit="%" />
                                <ProSlider label="Contrast" value={filters.contrast} min={0} max={200} defaultValue={100} onChange={v => setFilters({ ...filters, contrast: v })} unit="%" />
                                <ProSlider label="Saturation" value={filters.saturation} min={0} max={200} defaultValue={100} onChange={v => setFilters({ ...filters, saturation: v })} unit="%" />
                            </div>
                        )}
                        {activeTab === 'detail' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold theme-text-muted uppercase text-[10px]">Sharpening</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-1 theme-bg-secondary p-1 rounded-xl border theme-border">
                                        {sharpeningLevels.map(level => (
                                            <button
                                                key={level}
                                                onClick={() => setFilters({ ...filters, sharpening: level })}
                                                className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${filters.sharpening === level
                                                    ? 'bg-purple-600 text-white shadow-md'
                                                    : 'theme-text-muted hover:theme-text hover:theme-bg-elevated'
                                                    }`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold theme-text-muted uppercase text-[10px]">Output DPI</span>
                                        <span className="font-mono font-bold text-indigo-400 text-[10px]">{filters.dpi || initialDpi || 1200} DPI</span>
                                    </div>
                                    <select
                                        value={filters.dpi || 1200}
                                        onChange={(e) => setFilters({ ...filters, dpi: Number(e.target.value) })}
                                        className="w-full theme-bg-secondary theme-border border theme-text text-xs rounded-xl p-3 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        title="Output DPI"
                                    >
                                        {dpiOptions.map(dpi => <option key={dpi} value={dpi}>{dpi} DPI (Print)</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                        {activeTab === 'effects' && (
                            <div className="space-y-6 animate-fade-in">
                                <ProSlider label="Blur Radius" value={filters.blur} min={0} max={10} step={0.5} defaultValue={0} onChange={v => setFilters({ ...filters, blur: v })} unit="px" />
                                <ProSlider label="Grayscale" value={filters.grayscale} min={0} max={100} defaultValue={0} onChange={v => setFilters({ ...filters, grayscale: v })} unit="%" />
                                <ProSlider label="Sepia Tone" value={filters.sepia} min={0} max={100} defaultValue={0} onChange={v => setFilters({ ...filters, sepia: v })} unit="%" />
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t theme-border space-y-3 theme-bg-card">
                        <button onClick={() => onClose()} className="w-full py-3.5 theme-bg-secondary hover:theme-bg-elevated theme-text rounded-xl font-bold text-xs uppercase tracking-wide transition-all border theme-border">Cancel</button>
                        <button onClick={() => { onUpdateFrame(frame.id, filters); onClose(); }} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wide shadow-lg shadow-indigo-900/20 transition-all">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
