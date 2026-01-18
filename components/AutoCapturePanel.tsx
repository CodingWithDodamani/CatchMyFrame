
import React from 'react';
import { AutoCaptureMode } from '../types';
import { TimerIcon, StopIcon, ScissorsIcon, ContrastIcon, BrainCircuitIcon, InformationCircleIcon, SpinnerIcon, PlayIcon, CameraIcon } from './icons';

interface AutoCapturePanelProps {
    isAutoCapturing: boolean;
    onToggleAutoCapture: () => void;
    autoCaptureMode: AutoCaptureMode;
    onAutoCaptureModeChange: (mode: AutoCaptureMode) => void;
    isVideoReady: boolean;
    timeRange: { start: number, end: number };
    onSetTimeRange: (point: 'start' | 'end') => void;
    sceneDetectSensitivity: number;
    onSceneDetectSensitivityChange: (value: number) => void;
    isFastScanEnabled: boolean;
    onIsFastScanEnabledChange: (enabled: boolean) => void;
    isSlideModeEnabled: boolean;
    onIsSlideModeEnabledChange: (enabled: boolean) => void;

    aiStatus: string;
    aiSceneDetectSensitivity: number;
    onAiSceneDetectSensitivityChange: (value: number) => void;

    settingsFps: number;
    videoCurrentTime?: number;
}

const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00.000';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds * 1000) % 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
};

const AutoCapturePanel: React.FC<AutoCapturePanelProps> = ({
    isAutoCapturing,
    onToggleAutoCapture,
    autoCaptureMode,
    onAutoCaptureModeChange,
    isVideoReady,
    timeRange,
    onSetTimeRange,
    sceneDetectSensitivity,
    onSceneDetectSensitivityChange,
    isFastScanEnabled,
    onIsFastScanEnabledChange,
    isSlideModeEnabled,
    onIsSlideModeEnabledChange,

    aiStatus,
    aiSceneDetectSensitivity,
    onAiSceneDetectSensitivityChange,

    settingsFps,
    videoCurrentTime = 0,
}) => {
    // Calculate progress for time-range mode
    const rangeProgress = autoCaptureMode === 'timeRange' && isAutoCapturing && timeRange.end > timeRange.start
        ? Math.min(100, Math.max(0, ((videoCurrentTime - timeRange.start) / (timeRange.end - timeRange.start)) * 100))
        : 0;

    const captureModes = [
        { id: 'off' as AutoCaptureMode, label: 'Manual', icon: <StopIcon className="w-4 h-4" />, desc: 'Capture disabled' },
        { id: 'interval' as AutoCaptureMode, label: 'Interval', icon: <TimerIcon className="w-4 h-4" />, desc: 'Timed capture' },
        { id: 'timeRange' as AutoCaptureMode, label: 'Range', icon: <ScissorsIcon className="w-4 h-4" />, desc: 'Between A-B' },
        { id: 'pixelDetect' as AutoCaptureMode, label: 'Visual', icon: <ContrastIcon className="w-4 h-4" />, desc: 'Pixel changes' },
        { id: 'aiDetect' as AutoCaptureMode, label: 'AI Smart', icon: <BrainCircuitIcon className="w-4 h-4" />, desc: 'Gemini Analysis' }
    ];

    const isAiProcessing = isAutoCapturing && autoCaptureMode === 'aiDetect' && (aiStatus.includes('Capturing') || aiStatus.includes('Asking') || aiStatus.includes('Initializing') || aiStatus.includes('Setting baseline'));
    const isAiError = aiStatus.toLowerCase().includes('failed');

    return (
        <div className="w-full theme-bg-card theme-surface-glass theme-border border rounded-2xl overflow-hidden shadow-2xl">
            {/* HUD Header */}
            <div className="px-6 py-4 theme-border border-b theme-bg-secondary flex justify-between items-center">
                <div className="flex items-center gap-2 theme-text font-bold tracking-wide text-sm">
                    <TimerIcon className="w-4 h-4 text-indigo-400" />
                    <span>AUTOMATION HUB</span>
                </div>
                {isAutoCapturing && (
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-red-400">RECORDING</span>
                    </div>
                )}
            </div>

            <div className="p-6">
                {/* Mode Selector Tabs */}
                {!isAutoCapturing && (
                    <div className="flex flex-wrap gap-2 mb-8 p-1.5 theme-bg-secondary theme-border border rounded-xl">
                        {captureModes.map((mode) => {
                            const isActive = autoCaptureMode === mode.id;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => onAutoCaptureModeChange(mode.id)}
                                    disabled={!isVideoReady}
                                    className={`flex-1 min-w-[80px] flex flex-col items-center justify-center gap-1.5 py-3 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-[var(--brand-primary)] text-[var(--text-inverse)] shadow-lg'
                                        : 'theme-text-muted hover:theme-text hover:theme-bg-elevated'
                                        } disabled:opacity-30`}
                                >
                                    {mode.icon}
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{mode.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Main Content Area */}
                {isAutoCapturing ? (
                    // ACTIVE MONITORING STATE
                    <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse"></div>
                            <div className="relative w-24 h-24 rounded-full theme-bg-elevated border-4 border-indigo-500/30 flex items-center justify-center">
                                {autoCaptureMode === 'aiDetect' ? <BrainCircuitIcon className="w-10 h-10 text-indigo-400" /> : <CameraIcon className="w-10 h-10 text-indigo-400" />}
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold theme-text mb-1">{captureModes.find(m => m.id === autoCaptureMode)?.label} Active</h2>
                        <p className="theme-text-muted text-sm mb-4 font-mono">Monitoring video stream...</p>

                        {/* Time Range Progress Bar */}
                        {autoCaptureMode === 'timeRange' && (
                            <div className="w-full max-w-xs mb-6">
                                <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1">
                                    <span>{formatTime(timeRange.start)}</span>
                                    <span className="text-indigo-400 font-bold">{rangeProgress.toFixed(0)}%</span>
                                    <span>{formatTime(timeRange.end)}</span>
                                </div>
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
                                        style={{ width: `${rangeProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {autoCaptureMode === 'aiDetect' && (
                            <div className="mb-6 px-4 py-2 theme-bg-elevated rounded-lg theme-border border flex items-center gap-3">
                                {isAiProcessing && <SpinnerIcon className="w-4 h-4 text-indigo-400 animate-spin" />}
                                <span className={`text-xs font-mono ${isAiError ? 'text-red-400' : 'text-indigo-300'}`}>{aiStatus}</span>
                            </div>
                        )}

                        <button
                            onClick={onToggleAutoCapture}
                            className="flex items-center gap-3 px-8 py-4 btn-danger font-bold rounded-xl shadow-lg shadow-red-900/30 transition-all hover:scale-105"
                        >
                            <StopIcon className="w-6 h-6" />
                            STOP CAPTURE
                        </button>
                    </div>
                ) : (
                    // CONFIGURATION STATE
                    <div className="animate-fade-in">
                        {autoCaptureMode === 'off' && (
                            <div className="text-center py-10 theme-text-muted border-2 border-dashed theme-border-secondary rounded-xl theme-bg-secondary">
                                <InformationCircleIcon className="w-8 h-8 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">Select an automation mode to configure triggers.</p>
                            </div>
                        )}

                        {autoCaptureMode !== 'off' && (
                            <div className="space-y-6">
                                {/* Dynamic Config Block */}
                                <div className="theme-bg-secondary p-5 rounded-xl theme-border border space-y-5">
                                    {autoCaptureMode === 'interval' && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold theme-text">Capture Rate</span>
                                            <div className="text-right">
                                                <div className="text-xl font-mono font-bold text-indigo-400">{(1000 / settingsFps).toFixed(0)}ms</div>
                                                <div className="text-[10px] text-gray-500 uppercase">Approx {settingsFps} FPS</div>
                                            </div>
                                        </div>
                                    )}

                                    {autoCaptureMode === 'timeRange' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="theme-bg-elevated p-3 rounded-lg theme-border border">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Start Time</label>
                                                <div className="text-green-400 font-mono text-lg font-bold mb-2">{formatTime(timeRange.start)}</div>
                                                <button onClick={() => onSetTimeRange('start')} className="w-full py-1.5 theme-bg-card hover:theme-bg-secondary text-xs theme-text rounded font-bold transition-colors">Set Current</button>
                                            </div>
                                            <div className="theme-bg-elevated p-3 rounded-lg theme-border border">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">End Time</label>
                                                <div className="text-red-400 font-mono text-lg font-bold mb-2">{formatTime(timeRange.end)}</div>
                                                <button onClick={() => onSetTimeRange('end')} className="w-full py-1.5 theme-bg-card hover:theme-bg-secondary text-xs theme-text rounded font-bold transition-colors">Set Current</button>
                                            </div>
                                        </div>
                                    )}

                                    {autoCaptureMode === 'pixelDetect' && (
                                        <div className="space-y-4">


                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                                                    <span>Sensitivity Threshold</span>
                                                    <span className="text-indigo-400">{sceneDetectSensitivity}%</span>
                                                </div>
                                                <input
                                                    type="range" min="1" max="100"
                                                    value={sceneDetectSensitivity}
                                                    onChange={(e) => onSceneDetectSensitivityChange(Number(e.target.value))}
                                                    className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                                                    title="Sensitivity Threshold"
                                                />
                                            </div>
                                            <label className="flex items-center justify-between p-3 theme-bg-elevated/50 rounded-lg cursor-pointer hover:theme-bg-elevated transition-colors">
                                                <span className="text-sm font-bold theme-text-secondary">Fast Scan Mode</span>
                                                <input type="checkbox" checked={isFastScanEnabled} onChange={(e) => onIsFastScanEnabledChange(e.target.checked)} className="w-5 h-5 rounded border-gray-600 text-indigo-500 bg-gray-800 focus:ring-indigo-500/50" />
                                            </label>
                                            <label className="flex items-center justify-between p-3 theme-bg-elevated rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold theme-text">Slide / Presentation Mode</span>
                                                    <span className="text-[10px] theme-text-muted uppercase tracking-wide">Wait for text to sharpen (Delay 0.75s)</span>
                                                </div>
                                                <input type="checkbox" checked={isSlideModeEnabled} onChange={(e) => onIsSlideModeEnabledChange(e.target.checked)} className="w-5 h-5 rounded border-gray-600 text-indigo-500 bg-gray-800 focus:ring-indigo-500/50" />
                                            </label>
                                        </div>
                                    )}

                                    {autoCaptureMode === 'aiDetect' && (
                                        <div className="space-y-4">
                                            <div className="p-3 bg-indigo-900/20 border border-indigo-500/20 rounded-lg text-xs text-indigo-200">
                                                <BrainCircuitIcon className="w-4 h-4 inline mr-2" />
                                                Gemini AI will analyze frames for semantic scene changes.
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                                                    <span>Change Confidence</span>
                                                    <span className="text-indigo-400">{aiSceneDetectSensitivity}%</span>
                                                </div>
                                                <input
                                                    type="range" min="1" max="100"
                                                    value={aiSceneDetectSensitivity}
                                                    onChange={(e) => onAiSceneDetectSensitivityChange(Number(e.target.value))}
                                                    className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={onToggleAutoCapture}
                                    disabled={!isVideoReady}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 btn-primary font-bold rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PlayIcon className="w-5 h-5" />
                                    START AUTOMATION
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AutoCapturePanel;
