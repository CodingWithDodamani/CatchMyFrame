import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { CapturedFrame, FilterConfig, SharpeningLevel } from '../types';
import { DownloadIcon, ZipIcon, SpinnerIcon, TrashIcon, TimerIcon, PdfIcon, WandIcon, EyeIcon, AdjustmentsIcon, CheckCircleIcon, ContrastIcon, LayersIcon, DiamondIcon, InformationCircleIcon, SunIcon, DropIcon, GridIcon, CircleHalfIcon, ZapIcon, RotateCcwIcon, ChevronDownIcon, ChevronUpIcon, WifiOffIcon, ArrowsUpDownIcon } from './icons';
import { injectDpi, processImage, applySharpening, getCssFilterString } from '../utils';
import { LazyImage } from './LazyImage';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Helper arrays for sliders
const sharpeningLevels: SharpeningLevel[] = ['off', 'low', 'medium', 'high'];
const dpiOptions = [72, 96, 150, 300, 600, 1200, 2400];

// Format frame timestamp to MM:SS.ms
const formatFrameTimestamp = (seconds: number) => {
    if (typeof seconds !== 'number') return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

// Imported sub-components
import { ProSlider } from './gallery/ProSlider';
import { PreviewEditorModal } from './gallery/PreviewEditorModal';

// --- MAIN COMPONENTS ---

interface FramePreviewProps {
    frame: CapturedFrame;
    onDelete: (id: string) => void;
    onPreview: (frame: CapturedFrame) => void;
    onReset: (id: string) => void;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    globalSharpeningLevel: SharpeningLevel;
    globalDpi: number | null;
}

const FramePreviewInner: React.FC<FramePreviewProps> = ({ frame, onDelete, onPreview, onReset, isSelected, onToggleSelect, globalSharpeningLevel, globalDpi }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
    const localSharpening = frame.filters?.sharpening || 'off';
    const localDpi = frame.filters?.dpi || globalDpi;

    // Live Preview Logic
    useEffect(() => {
        if (!isHovered) { setPreviewDataUrl(null); return; }
        const timer = setTimeout(async () => {
            try {
                const previewFilters: FilterConfig = { ...frame.filters!, sharpening: globalSharpeningLevel };
                const url = await processImage(frame.dataUrl, previewFilters);
                setPreviewDataUrl(url);
            } catch (e) { console.error(e); }
        }, 50);
        return () => clearTimeout(timer);
    }, [isHovered, globalSharpeningLevel, frame]);

    // Check if frame has custom modifications compared to default "low" sharpening baseline
    const isModified = () => {
        const f = frame.filters;
        if (!f) return false;
        return (
            f.brightness !== 100 ||
            f.contrast !== 100 ||
            f.saturation !== 100 ||
            f.blur !== 0 ||
            f.grayscale !== 0 ||
            f.sepia !== 0 ||
            f.sharpening !== 'low'
        );
    };

    const edited = isModified();

    return (
        <div
            onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onClick={() => onToggleSelect(frame.id)}
            className={`group relative aspect-video rounded-xl shadow-lg theme-card theme-border transition-all duration-300 cursor-pointer overflow-hidden ring-1 ${isSelected ? 'ring-indigo-500 ring-offset-2 ring-offset-black scale-[1.02] z-10' : 'theme-border hover:ring-white/30 hover:shadow-2xl'}`}
        >
            {/* The Image */}
            <LazyImage
                src={frame.dataUrl}
                alt={`Frame ${frame.id}`}
                className="w-full h-full"
                imageClassName="transition-transform duration-500 group-hover:scale-105"
                style={{ filter: getCssFilterString(frame.filters) }}
            />

            {/* Selection Checkbox */}
            <div className="absolute top-3 left-3 z-20" onClick={(e) => e.stopPropagation()}>
                <div onClick={() => onToggleSelect(frame.id)} className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shadow-sm ${isSelected ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)]' : 'bg-black/50 border-white/30 hover:border-white/80 backdrop-blur-sm'}`}>
                    {isSelected && <CheckCircleIcon className="w-3.5 h-3.5 text-white" />}
                </div>
            </div>

            {/* Modified Indicator */}
            {edited && (
                <div className="absolute top-3 right-3 z-20" title="Frame has custom edits">
                    <div className="w-6 h-6 rounded-full bg-yellow-500/90 text-black flex items-center justify-center shadow-lg backdrop-blur-sm animate-in zoom-in">
                        <AdjustmentsIcon className="w-3 h-3" />
                    </div>
                </div>
            )}

            {/* Metadata Badges */}
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 pointer-events-none z-10 opacity-90">
                {localSharpening !== 'off' && <span className="bg-purple-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md flex items-center gap-1 uppercase tracking-wider">SHARP</span>}
                {localDpi && <span className="bg-blue-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm backdrop-blur-md flex items-center gap-1 uppercase tracking-wider">{localDpi} DPI</span>}
            </div>

            {/* Timestamp Badge */}
            <div className="absolute bottom-3 right-3 pointer-events-none z-10 opacity-90">
                <span className="bg-black/70 text-gray-300 text-[10px] font-mono font-bold px-2 py-1 rounded-md backdrop-blur-md border border-white/10 shadow-sm">
                    {formatFrameTimestamp(frame.timestamp)}
                </span>
            </div>

            {/* Hover Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 backdrop-blur-[1px] z-30">
                <button onClick={(e) => { e.stopPropagation(); onPreview(frame); }} className="w-10 h-10 rounded-full bg-white text-black hover:bg-gray-200 flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75" title="Open Editor">
                    <EyeIcon className="w-5 h-5" />
                </button>
                {edited && (
                    <button onClick={(e) => { e.stopPropagation(); onReset(frame.id); }} className="w-10 h-10 rounded-full bg-yellow-500 text-black hover:bg-yellow-400 flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100" title="Reset Edits">
                        <RotateCcwIcon className="w-5 h-5" />
                    </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); onDelete(frame.id); }} className="w-10 h-10 rounded-full bg-red-500/90 hover:bg-red-500 text-white flex items-center justify-center shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-150" title="Delete Frame">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// Memoized FramePreview to prevent unnecessary re-renders
const FramePreview = memo(FramePreviewInner, (prevProps, nextProps) => {
    // Custom comparator - only re-render if these specific props change
    return (
        prevProps.frame.id === nextProps.frame.id &&
        prevProps.frame.dataUrl === nextProps.frame.dataUrl &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.globalSharpeningLevel === nextProps.globalSharpeningLevel &&
        prevProps.globalDpi === nextProps.globalDpi &&
        JSON.stringify(prevProps.frame.filters) === JSON.stringify(nextProps.frame.filters)
    );
});

interface FrameGalleryProps {
    frames: CapturedFrame[];
    onClearAll: (options?: { skipConfirm?: boolean }) => void;
    onDeleteFrame: (id: string) => void;
    onDeleteFrames?: (ids: string[]) => void;
    onUpdateFrame: (id: string, filters: FilterConfig) => void;
    onUpdateAllFrames: (filters: FilterConfig) => void;
    captureDuration: number | null;
    isOnline?: boolean;
    initialExportFormat: 'jpeg' | 'png' | 'webp';
    onExportFormatChange: (format: 'jpeg' | 'png' | 'webp') => void;
}

const FrameGallery: React.FC<FrameGalleryProps> = ({ frames, onClearAll, onDeleteFrame, onDeleteFrames, onUpdateFrame, onUpdateAllFrames, captureDuration, isOnline = true, initialExportFormat, onExportFormatChange }) => {
    const [isZipping, setIsZipping] = useState(false);
    const [isPdfing, setIsPdfing] = useState(false);
    const [isAutoClearTimerActive, setIsAutoClearTimerActive] = useState(false);
    const [autoClearCountdown, setAutoClearCountdown] = useState(60);
    const [previewFrame, setPreviewFrame] = useState<CapturedFrame | null>(null);
    const [selectedFrameIds, setSelectedFrameIds] = useState<Set<string>>(new Set());
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const timerRef = useRef<number | null>(null);
    const debounceTimerRef = useRef<number | null>(null);

    // Derived Sorted Frames
    const sortedFrames = useMemo(() => {
        return [...frames].sort((a, b) => {
            return sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
        });
    }, [frames, sortOrder]);

    // BULK EDIT STATE
    const [activeBulkTab, setActiveBulkTab] = useState<'light' | 'detail' | 'effects'>('light');
    const [bulkDpi, setBulkDpi] = useState<number | null>(null);
    const [bulkFilters, setBulkFilters] = useState<FilterConfig>({
        brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, sharpening: 'low'
    });

    // EXPORT SETTINGS STATE
    type NamingPattern = 'original' | 'timestamp_index' | 'scene_index';
    type ExportFormat = 'jpeg' | 'png' | 'webp';
    type QualityPreset = 'web' | 'print' | 'original';

    const [exportNamingPattern, setExportNamingPattern] = useState<NamingPattern>('original');
    const exportFormat = initialExportFormat; // Use prop directly as the 'state'
    const setExportFormat = onExportFormatChange; // Alias for compatibility
    const [exportQuality, setExportQuality] = useState<QualityPreset>('original');
    const [showExportOptions, setShowExportOptions] = useState(false);

    // Generate filename based on pattern
    const generateExportFilename = useCallback((frame: CapturedFrame, index: number): string => {
        const ext = exportFormat;
        const timestamp = formatFrameTimestamp(frame.timestamp).replace(/[:.]/g, '-');

        switch (exportNamingPattern) {
            case 'timestamp_index':
                return `frame_${timestamp}_${String(index + 1).padStart(3, '0')}.${ext}`;
            case 'scene_index':
                return `scene_${String(index + 1).padStart(3, '0')}.${ext}`;
            case 'original':
            default:
                // Keep original name but change extension
                const baseName = frame.filename.replace(/\.[^/.]+$/, '');
                return `${baseName}.${ext}`;
        }
    }, [exportNamingPattern, exportFormat]);

    // Debounced bulk filter change for performance
    const handleBulkFilterChange = useCallback((key: keyof FilterConfig, value: any) => {
        const newFilters = { ...bulkFilters, [key]: value };
        setBulkFilters(newFilters);

        // Debounce the actual frame updates
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = window.setTimeout(() => {
            const targetIds = selectedFrameIds.size > 0 ? Array.from(selectedFrameIds) : frames.map(f => f.id);
            targetIds.forEach(id => {
                const frame = frames.find(f => f.id === id);
                if (frame) onUpdateFrame(id, { ...frame.filters!, [key]: value });
            });
        }, 50); // 50ms debounce
    }, [bulkFilters, selectedFrameIds, frames, onUpdateFrame]);

    const handleBulkDpiChange = (val: number | null) => {
        setBulkDpi(val);
        if (val) handleBulkFilterChange('dpi', val);
    };

    const handleResetTab = () => {
        if (activeBulkTab === 'light') {
            handleBulkFilterChange('brightness', 100);
            handleBulkFilterChange('contrast', 100);
            handleBulkFilterChange('saturation', 100);
        } else if (activeBulkTab === 'detail') {
            handleBulkFilterChange('sharpening', 'off');
            handleBulkDpiChange(null);
        } else if (activeBulkTab === 'effects') {
            handleBulkFilterChange('blur', 0);
            handleBulkFilterChange('grayscale', 0);
            handleBulkFilterChange('sepia', 0);
        }
    };

    const handleResetFrame = (id: string) => {
        const frame = frames.find(f => f.id === id);
        if (frame) {
            onUpdateFrame(id, {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                blur: 0,
                grayscale: 0,
                sepia: 0,
                sharpening: 'low', // Reset to default capture state
                dpi: frame.filters?.dpi || 1200
            });
        }
    };

    const handleToggleAutoClear = () => {
        setIsAutoClearTimerActive(prev => {
            const newState = !prev;
            if (newState) setAutoClearCountdown(60);
            return newState;
        });
    };

    useEffect(() => {
        const newSet = new Set(selectedFrameIds);
        let changed = false;
        selectedFrameIds.forEach(id => { if (!frames.find(f => f.id === id)) { newSet.delete(id); changed = true; } });
        if (changed) setSelectedFrameIds(newSet);
    }, [frames]);

    useEffect(() => {
        if (previewFrame) {
            const updatedFrame = frames.find(f => f.id === previewFrame.id);
            if (updatedFrame && updatedFrame !== previewFrame) setPreviewFrame(updatedFrame);
        }
    }, [frames, previewFrame]);

    useEffect(() => {
        if (isAutoClearTimerActive && frames.length > 0) {
            timerRef.current = window.setInterval(() => {
                setAutoClearCountdown(prev => {
                    if (prev <= 1) { clearInterval(timerRef.current!); setIsAutoClearTimerActive(false); onClearAll({ skipConfirm: true }); return 60; }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
            if (!isAutoClearTimerActive || frames.length === 0) { setIsAutoClearTimerActive(false); setAutoClearCountdown(60); }
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isAutoClearTimerActive, onClearAll, frames.length]);

    const formatDuration = (ms: number) => {
        if (ms < 0) return '00:00.000';
        const totalSeconds = ms / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const milliseconds = Math.floor(ms % 1000);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    };

    const toggleFrameSelection = (id: string) => {
        const newSet = new Set(selectedFrameIds);
        if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
        setSelectedFrameIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedFrameIds.size === frames.length) setSelectedFrameIds(new Set());
        else setSelectedFrameIds(new Set(frames.map(f => f.id)));
    };

    const getFramesToProcess = () => selectedFrameIds.size === 0 ? frames : frames.filter(f => selectedFrameIds.has(f.id));

    const handleDownloadAll = async () => {
        const targetFrames = getFramesToProcess();
        if (targetFrames.length === 0 || isZipping) return;

        // Offline safeguard
        if (typeof JSZip === 'undefined') {
            alert("Export functionality requires libraries that could not be loaded. Please connect to the internet and refresh.");
            return;
        }

        setIsZipping(true);
        try {
            const zip = new JSZip();

            // Determine quality settings based on preset
            let jpegQuality = 0.92;
            let targetDpi: number | null = null;
            if (exportQuality === 'web') {
                jpegQuality = 0.8;
                targetDpi = 72;
            } else if (exportQuality === 'print') {
                targetDpi = 300;
            }

            for (let i = 0; i < targetFrames.length; i++) {
                const frame = targetFrames[i];
                const dataUrlToUse = await processImage(frame.dataUrl, frame.filters);

                // Convert to target format
                const img = new Image();
                img.src = dataUrlToUse;
                await new Promise(resolve => img.onload = resolve);

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) continue;
                ctx.drawImage(img, 0, 0);

                // Get data URL in target format
                let mimeType = 'image/jpeg';
                let finalDataUrl = '';
                if (exportFormat === 'png') {
                    mimeType = 'image/png';
                    finalDataUrl = canvas.toDataURL(mimeType);
                } else if (exportFormat === 'webp') {
                    mimeType = 'image/webp';
                    finalDataUrl = canvas.toDataURL(mimeType, jpegQuality);
                } else {
                    finalDataUrl = canvas.toDataURL(mimeType, jpegQuality);
                }

                // Inject DPI if needed
                if (targetDpi || frame.filters?.dpi) {
                    finalDataUrl = injectDpi(finalDataUrl, targetDpi || frame.filters?.dpi || 72);
                }

                const base64Data = finalDataUrl.split(',')[1];
                const filename = generateExportFilename(frame, i);
                zip.file(filename, base64Data, { base64: true });
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'captured-frames.zip');
        } catch (error) {
            console.error("Failed to create ZIP", error);
            alert("Error creating ZIP. Please try again.");
        }
        finally { setIsZipping(false); }
    };

    const handleBulkDelete = () => {
        if (selectedFrameIds.size === 0) return;
        if (window.confirm(`Delete ${selectedFrameIds.size} selected frames?`)) {
            if (onDeleteFrames) {
                onDeleteFrames(Array.from(selectedFrameIds));
            } else {
                // Fallback (less efficient but works)
                selectedFrameIds.forEach(id => onDeleteFrame(id));
            }
            setSelectedFrameIds(new Set());
        }
    };

    const handleDownloadPdf = async () => {
        const targetFrames = getFramesToProcess();
        if (targetFrames.length === 0 || isPdfing) return;

        if (typeof window.jspdf === 'undefined') {
            alert("PDF functionality unavailable offline. Please check your connection.");
            return;
        }

        setIsPdfing(true);
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.deletePage(1);
            for (const frame of targetFrames) {
                const dataUrlToUse = await processImage(frame.dataUrl, frame.filters);
                const img = new Image(); img.src = dataUrlToUse;
                await new Promise(resolve => img.onload = resolve);
                const widthMm = (img.width / 72) * 25.4;
                const heightMm = (img.height / 72) * 25.4;
                doc.addPage([widthMm, heightMm], widthMm > heightMm ? 'l' : 'p');
                doc.addImage(dataUrlToUse, frame.fileExtension.toUpperCase(), 0, 0, widthMm, heightMm);
            }
            doc.save("captured-frames.pdf");
        } catch (error) {
            console.error("Failed to create PDF", error);
            alert("Error creating PDF.");
        }
        finally { setIsPdfing(false); }
    };

    if (frames.length === 0) {
        return (
            <div className="w-full max-w-2xl mx-auto mt-8 animate-fade-in">
                <div className="p-12 text-center theme-bg-secondary backdrop-blur-md border-2 border-dashed theme-border-secondary rounded-3xl">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full theme-bg-elevated flex items-center justify-center">
                        <LayersIcon className="w-10 h-10 theme-text-muted" />
                    </div>
                    <h3 className="text-xl font-bold theme-text mb-2">No Frames Captured</h3>
                    <p className="theme-text-muted text-sm max-w-sm mx-auto">
                        Use the <span className="font-bold text-indigo-400">Capture Frame</span> button or press <code className="theme-bg-secondary px-1.5 py-0.5 rounded text-xs font-mono">C</code> to grab the current frame.
                    </p>
                </div>
            </div>
        );
    }

    const isSelectionActive = selectedFrameIds.size > 0;

    return (
        <div className="w-full max-w-7xl mx-auto mt-8 animate-fade-in">

            {/* STUDIO EDITOR CONTROL CENTER */}
            <div className={`theme-card backdrop-blur-md rounded-2xl theme-border border shadow-2xl overflow-hidden mb-8 ring-1 ring-white/5 transition-all duration-300 ${isEditorCollapsed ? 'h-auto' : ''}`}>

                {/* 1. Header Bar */}
                <div className="flex items-center justify-between px-6 py-4 theme-bg-elevated border-b theme-border">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsEditorCollapsed(!isEditorCollapsed)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg theme-text-muted hover:theme-text hover:theme-bg-secondary transition-colors"
                        >
                            {isEditorCollapsed ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <LayersIcon className="w-5 h-5 text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-sm font-extrabold theme-text uppercase tracking-wider">Studio Editor</h2>
                                <p className="text-[10px] theme-text-muted">Bulk Adjustments & Export</p>
                            </div>
                        </div>

                        <div className="h-8 w-px theme-border mx-2 hidden sm:block"></div>

                        <div className="flex items-center gap-3">
                            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all border ${selectedFrameIds.size === frames.length ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'hover:theme-bg-secondary border-transparent theme-text-muted'}`}>
                                <input type="checkbox" checked={selectedFrameIds.size === frames.length && frames.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-600 text-indigo-500 theme-bg-elevated focus:ring-indigo-500 focus:ring-offset-gray-900" />
                                <span className="text-xs font-bold hidden sm:inline">Select All</span>
                            </label>

                            {isSelectionActive ? (
                                <span className="text-xs font-bold text-white bg-indigo-600 px-3 py-1 rounded-full shadow-lg shadow-indigo-900/20 animate-pulse">
                                    Editing {selectedFrameIds.size} Selected
                                </span>
                            ) : (
                                <span className="text-xs font-medium theme-text-muted italic hidden sm:inline">
                                    Applying to all frames
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {captureDuration !== null && (
                            <div className="text-xs font-mono theme-text-muted theme-bg-secondary px-3 py-1.5 rounded-lg border theme-border flex items-center gap-2">
                                <TimerIcon className="w-3 h-3" /> {formatDuration(captureDuration)}
                            </div>
                        )}
                        <button onClick={() => onClearAll()} disabled={isZipping || isPdfing} className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold rounded-lg border border-red-500/20 transition-all">
                            <TrashIcon className="w-4 h-4" /> <span className="hidden sm:inline">Clear Gallery</span>
                        </button>
                    </div>
                </div>

                {/* Sub-Header: Filter & Sort Bar */}
                <div className="flex items-center justify-between px-6 py-3 theme-bg-card border-b theme-border animate-fade-in">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider theme-text-muted hover:theme-text transition-colors"
                        >
                            <ArrowsUpDownIcon className="w-3.5 h-3.5" />
                            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                        </button>
                    </div>
                    {isSelectionActive && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors animate-in fade-in"
                        >
                            <TrashIcon className="w-3.5 h-3.5" /> Delete Selected ({selectedFrameIds.size})
                        </button>
                    )}
                </div>

                {!isEditorCollapsed && (
                    <div className="animate-slide-down">
                        {/* 2. Main Workstation Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-white/5 min-h-[220px]">

                            {/* Navigation Sidebar */}
                            <div className="theme-bg-secondary p-4 flex flex-col gap-2">
                                <span className="text-[10px] font-bold theme-text-muted uppercase tracking-widest px-2 mb-2">Tools</span>
                                <button onClick={() => setActiveBulkTab('light')} className={`group flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wide ${activeBulkTab === 'light' ? 'bg-[var(--brand-primary)] text-[var(--text-inverse)] shadow-lg border theme-border' : 'theme-text-muted hover:theme-text hover:theme-bg-card'}`}>
                                    <span className="flex items-center gap-3"><SunIcon className={`w-4 h-4 ${activeBulkTab === 'light' ? 'theme-text-inverse' : 'theme-text-muted group-hover:theme-text'}`} /> Light</span>
                                    {activeBulkTab === 'light' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                </button>
                                <button onClick={() => setActiveBulkTab('detail')} className={`group flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wide ${activeBulkTab === 'detail' ? 'bg-[var(--brand-primary)] text-[var(--text-inverse)] shadow-lg border theme-border' : 'theme-text-muted hover:theme-text hover:theme-bg-card'}`}>
                                    <span className="flex items-center gap-3"><DiamondIcon className={`w-4 h-4 ${activeBulkTab === 'detail' ? 'theme-text-inverse' : 'theme-text-muted group-hover:theme-text'}`} /> Detail</span>
                                    {activeBulkTab === 'detail' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                </button>
                                <button onClick={() => setActiveBulkTab('effects')} className={`group flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wide ${activeBulkTab === 'effects' ? 'bg-[var(--brand-primary)] text-[var(--text-inverse)] shadow-lg border theme-border' : 'theme-text-muted hover:theme-text hover:theme-bg-card'}`}>
                                    <span className="flex items-center gap-3"><ZapIcon className={`w-4 h-4 ${activeBulkTab === 'effects' ? 'theme-text-inverse' : 'theme-text-muted group-hover:theme-text'}`} /> Effects</span>
                                    {activeBulkTab === 'effects' && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                </button>
                                <div className="mt-auto pt-4 border-t theme-border">
                                    <button onClick={handleResetTab} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold theme-text-muted hover:theme-text hover:theme-bg-card rounded-lg transition-colors uppercase tracking-wide">
                                        <RotateCcwIcon className="w-3 h-3" /> Reset {activeBulkTab}
                                    </button>
                                </div>
                            </div>
                            {/* Controls Panel */}
                            <div className="p-8 theme-bg-card relative flex flex-col justify-center">
                                {/* Background Watermark */}
                                <div className="absolute top-4 right-4 opacity-[0.02] pointer-events-none grayscale">
                                    {activeBulkTab === 'light' && <SunIcon className="w-64 h-64" />}
                                    {activeBulkTab === 'detail' && <DiamondIcon className="w-64 h-64" />}
                                    {activeBulkTab === 'effects' && <ZapIcon className="w-64 h-64" />}
                                </div>

                                {activeBulkTab === 'light' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 animate-fade-in max-w-5xl">
                                        <ProSlider label="Exposure" value={bulkFilters.brightness} min={0} max={200} defaultValue={100} onChange={v => handleBulkFilterChange('brightness', v)} unit="%" />
                                        <ProSlider label="Contrast" value={bulkFilters.contrast} min={0} max={200} defaultValue={100} onChange={v => handleBulkFilterChange('contrast', v)} unit="%" />
                                        <ProSlider label="Saturation" value={bulkFilters.saturation} min={0} max={200} defaultValue={100} onChange={v => handleBulkFilterChange('saturation', v)} unit="%" />
                                    </div>
                                )}

                                {activeBulkTab === 'detail' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 animate-fade-in max-w-5xl">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold theme-text-muted uppercase tracking-wide">Sharpness</label>
                                                <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{bulkFilters.sharpening.toUpperCase()}</span>
                                            </div>
                                            <div className="theme-bg-secondary p-1.5 rounded-xl flex shadow-inner border theme-border">
                                                {sharpeningLevels.map(level => (
                                                    <button
                                                        key={level}
                                                        onClick={() => handleBulkFilterChange('sharpening', level)}
                                                        className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${bulkFilters.sharpening === level
                                                            ? 'bg-purple-600 text-white shadow-lg'
                                                            : 'theme-text-muted hover:theme-text hover:theme-bg-elevated'
                                                            }`}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Target DPI</label>
                                                <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{bulkDpi ? `${bulkDpi} DPI` : 'Original'}</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-1 theme-bg-secondary p-1.5 rounded-xl shadow-inner border theme-border">
                                                <button onClick={() => handleBulkDpiChange(null)} className={`py-2 text-[10px] font-bold rounded-lg uppercase ${!bulkDpi ? 'theme-bg-elevated theme-text' : 'theme-text-muted hover:theme-text'}`}>Orig</button>
                                                {[72, 300, 600].map(dpi => (
                                                    <button
                                                        key={dpi}
                                                        onClick={() => handleBulkDpiChange(dpi)}
                                                        className={`py-2 text-[10px] font-bold rounded-lg transition-all ${bulkDpi === dpi ? 'bg-indigo-600 text-white shadow' : 'theme-text-muted hover:theme-text hover:theme-bg-elevated'}`}
                                                    >
                                                        {dpi}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex justify-end">
                                                <select
                                                    value={bulkDpi ?? 'custom'}
                                                    onChange={(e) => handleBulkDpiChange(Number(e.target.value))}
                                                    className="bg-transparent text-[10px] theme-text-muted border-none focus:ring-0 cursor-pointer hover:text-indigo-400 font-bold uppercase tracking-wide text-right"
                                                    title="Advanced DPI"
                                                >
                                                    <option value="custom" disabled>Advanced DPI...</option>
                                                    {dpiOptions.filter(d => ![72, 300, 600].includes(d)).map(d => <option key={d} value={d}>{d} DPI</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeBulkTab === 'effects' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-fade-in max-w-5xl">
                                        <ProSlider label="Blur Radius" value={bulkFilters.blur} min={0} max={10} step={0.5} defaultValue={0} onChange={v => handleBulkFilterChange('blur', v)} unit="px" />
                                        <ProSlider label="Grayscale" value={bulkFilters.grayscale} min={0} max={100} defaultValue={0} onChange={v => handleBulkFilterChange('grayscale', v)} unit="%" />
                                        <ProSlider label="Sepia Tone" value={bulkFilters.sepia} min={0} max={100} defaultValue={0} onChange={v => handleBulkFilterChange('sepia', v)} unit="%" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Footer / Action Bar */}
                        <div className="theme-bg border-t theme-border px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                            <button
                                onClick={handleToggleAutoClear}
                                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-4 py-3 rounded-xl transition-colors border ${isAutoClearTimerActive ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 'theme-bg-secondary theme-text-muted theme-border hover:theme-text'}`}
                            >
                                {isAutoClearTimerActive ? (
                                    <><SpinnerIcon className="w-3 h-3" /> Auto-Clear: {autoClearCountdown}s</>
                                ) : (
                                    'Auto-Clear Timer'
                                )}
                            </button>

                            {/* Export Options Toggle */}
                            <button
                                onClick={() => setShowExportOptions(!showExportOptions)}
                                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-4 py-3 rounded-xl transition-colors border ${showExportOptions ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'theme-bg-secondary theme-text-muted theme-border hover:theme-text'}`}
                            >
                                <AdjustmentsIcon className="w-3 h-3" />
                                Export Options
                            </button>

                            <div className="flex items-center gap-3">
                                <button onClick={handleDownloadPdf} disabled={isPdfing} className="group relative flex items-center gap-2 px-6 py-3 theme-bg-elevated hover:bg-gray-700 text-white text-[10px] uppercase tracking-wider font-bold rounded-xl border theme-border shadow-lg transition-all disabled:opacity-50 disabled:shadow-none min-w-[150px] justify-center overflow-hidden">
                                    {isPdfing ? <SpinnerIcon className="w-4 h-4" /> : <PdfIcon className="w-4 h-4 text-red-400" />}
                                    <span>Export PDF {isSelectionActive && `(${selectedFrameIds.size})`}</span>
                                </button>
                                <button
                                    onClick={handleDownloadAll}
                                    disabled={isZipping}
                                    className={`group relative flex items-center gap-2 px-6 py-3 text-white text-[10px] uppercase tracking-wider font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:shadow-none min-w-[150px] justify-center overflow-hidden ${!isOnline ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'}`}
                                >
                                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    {isZipping ? <SpinnerIcon className="w-4 h-4" /> : <ZipIcon className="w-4 h-4" />}
                                    <span>Export ZIP {isSelectionActive && `(${selectedFrameIds.size})`}</span>
                                    {!isOnline && !isZipping && <WifiOffIcon className="w-3 h-3 ml-1 opacity-75" />}
                                </button>
                            </div>
                        </div>

                        {/* Export Options Panel - Mobile Optimized */}
                        {showExportOptions && (
                            <div className="theme-bg border-t theme-border px-4 sm:px-6 py-4 animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                    {/* Naming Pattern */}
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold theme-text-muted uppercase tracking-wider block">Naming</span>
                                        <div className="flex theme-bg-secondary rounded-lg p-1 gap-1">
                                            <button onClick={() => setExportNamingPattern('original')} className={`flex-1 px-2 sm:px-3 py-2 sm:py-1.5 text-[10px] font-bold rounded-md transition-all ${exportNamingPattern === 'original' ? 'bg-indigo-600 text-white' : 'theme-text-muted hover:theme-text'}`}>Original</button>
                                            <button onClick={() => setExportNamingPattern('timestamp_index')} className={`flex-1 px-2 sm:px-3 py-2 sm:py-1.5 text-[10px] font-bold rounded-md transition-all ${exportNamingPattern === 'timestamp_index' ? 'bg-indigo-600 text-white' : 'theme-text-muted hover:theme-text'}`}>Time</button>
                                            <button onClick={() => setExportNamingPattern('scene_index')} className={`flex-1 px-2 sm:px-3 py-2 sm:py-1.5 text-[10px] font-bold rounded-md transition-all ${exportNamingPattern === 'scene_index' ? 'bg-indigo-600 text-white' : 'theme-text-muted hover:theme-text'}`}>Scene</button>
                                        </div>
                                    </div>

                                    {/* Format */}
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold theme-text-muted uppercase tracking-wider block">Format</span>
                                        <div className="flex theme-bg-secondary rounded-lg p-1 gap-1">
                                            <button onClick={() => setExportFormat('jpeg')} className={`flex-1 px-2 sm:px-3 py-2 sm:py-1.5 text-[10px] font-bold rounded-md transition-all ${exportFormat === 'jpeg' ? 'bg-indigo-600 text-white' : 'theme-text-muted hover:theme-text'}`}>JPEG</button>
                                            <button onClick={() => setExportFormat('png')} className={`flex-1 px-2 sm:px-3 py-2 sm:py-1.5 text-[10px] font-bold rounded-md transition-all ${exportFormat === 'png' ? 'bg-indigo-600 text-white' : 'theme-text-muted hover:theme-text'}`}>PNG</button>
                                            <button onClick={() => setExportFormat('webp')} className={`flex-1 px-2 sm:px-3 py-2 sm:py-1.5 text-[10px] font-bold rounded-md transition-all ${exportFormat === 'webp' ? 'bg-emerald-600 text-white' : 'theme-text-muted hover:theme-text'}`}>WebP</button>
                                        </div>
                                    </div>

                                    {/* Quality Preset */}
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-bold theme-text-muted uppercase tracking-wider block">Quality</span>
                                        <div className="flex theme-bg-secondary rounded-lg p-1 gap-1">
                                            <button onClick={() => setExportQuality('web')} className={`flex-1 px-2 sm:px-3 py-2 sm:py-1.5 text-[10px] font-bold rounded-md transition-all ${exportQuality === 'web' ? 'bg-cyan-600 text-white' : 'theme-text-muted hover:theme-text'}`}>Web</button>
                                            <button onClick={() => setExportQuality('print')} className={`flex-1 px-2 sm:px-3 py-2 sm:py-1.5 text-[10px] font-bold rounded-md transition-all ${exportQuality === 'print' ? 'bg-purple-600 text-white' : 'theme-text-muted hover:theme-text'}`}>Print</button>
                                            <button onClick={() => setExportQuality('original')} className={`flex-1 px-2 sm:px-3 py-2 sm:py-1.5 text-[10px] font-bold rounded-md transition-all ${exportQuality === 'original' ? 'bg-indigo-600 text-white' : 'theme-text-muted hover:theme-text'}`}>Original</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview of filename pattern */}
                                <div className="mt-3 text-[10px] theme-text-muted truncate">
                                    Preview: <span className="theme-text-secondary font-mono">{generateExportFilename(frames[0] || { filename: 'frame.jpg', timestamp: 0, id: '', dataUrl: '', fileExtension: 'jpg' }, 0)}</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ENLARGED FRAME GRID: 3 columns on desktop, 2 on tablet, 1 on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {sortedFrames.map((frame) => {
                    const isSelected = selectedFrameIds.has(frame.id);
                    const localSharpening = frame.filters?.sharpening || 'off';
                    const localDpi = frame.filters?.dpi || bulkDpi;

                    return (
                        <FramePreview
                            key={frame.id}
                            frame={frame}
                            onDelete={onDeleteFrame}
                            onPreview={setPreviewFrame}
                            onReset={handleResetFrame}
                            isSelected={isSelected}
                            onToggleSelect={toggleFrameSelection}
                            globalSharpeningLevel={localSharpening}
                            globalDpi={localDpi}
                        />
                    );
                })}
            </div>

            {/* Live Preview Modal */}
            {previewFrame && (
                <PreviewEditorModal
                    frame={previewFrame}
                    onClose={() => setPreviewFrame(null)}
                    initialDpi={bulkDpi}
                    initialFilters={previewFrame.filters || { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, sharpening: 'low', dpi: bulkDpi || undefined }}
                    onUpdateFrame={onUpdateFrame}
                    onUpdateAllFrames={onUpdateAllFrames}
                />
            )}
        </div>
    );
};

export default FrameGallery;
