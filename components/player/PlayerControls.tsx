import React, { useState, useRef, useEffect } from 'react';
import {
    PlayIcon, PauseIcon, VolumeMuteIcon, VolumeMaxIcon, StepForwardIcon,
    SettingsIcon, PictureInPictureIcon, MaximizeIcon, MinimizeIcon, ViewColumnsIcon,
    KeyboardIcon
} from '../icons';
import { PlayerSettings } from './PlayerSettings';

interface PlayerControlsProps {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    playbackRate: number;
    isFullscreen: boolean;
    showStoryboard: boolean;

    // Actions
    onTogglePlay: () => void;
    onStepFrame: (direction: 'forward' | 'backward') => void;
    onToggleMute: () => void;
    onVolumeChange: (val: number) => void;
    onPlaybackRateChange: (rate: number) => void;
    onAddBookmark: () => void;
    onToggleStoryboard: () => void;
    onToggleFullscreen: () => void;
    onRequestPiP: () => void;
    onOpenShortcuts: () => void; // New prop for shortcuts button
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
    currentTime,
    duration,
    isPlaying,
    isMuted,
    volume,
    playbackRate,
    isFullscreen,
    showStoryboard,
    onTogglePlay,
    onStepFrame,
    onToggleMute,
    onVolumeChange,
    onPlaybackRateChange,
    onAddBookmark,
    onToggleStoryboard,
    onToggleFullscreen,
    onRequestPiP,
    onOpenShortcuts
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Close settings when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center justify-between pointer-events-auto">
            {/* Left: Time & Volume */}
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/5 shadow-lg">
                <div className="text-xs font-mono font-medium text-gray-300 tracking-wide">
                    <span className="text-white">{formatTime(currentTime)}</span>
                    <span className="mx-1.5 text-gray-600">/</span>
                    <span className="text-gray-500">{formatTime(duration)}</span>
                </div>
                <div className="w-px h-4 bg-white/10"></div>
                <div className="group/vol flex items-center gap-2">
                    <button onClick={onToggleMute} className="text-gray-400 hover:text-white transition-colors" title="Toggle Mute">
                        {isMuted || volume === 0 ? <VolumeMuteIcon className="w-4 h-4" /> : <VolumeMaxIcon className="w-4 h-4" />}
                    </button>
                    <div className="w-0 overflow-hidden group-hover/vol:w-16 transition-all duration-300 ease-out flex items-center">
                        <input
                            type="range" min="0" max="1" step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => onVolumeChange(Number(e.target.value))}
                            className="w-14 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-white"
                            title="Volume"
                        />
                    </div>
                </div>
            </div>

            {/* Center: Playback Controls (Floating Pill) */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-black/70 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl ring-1 ring-white/5 z-20">
                <button
                    onClick={() => onStepFrame('backward')}
                    className="p-3 sm:p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full active:scale-90"
                    title="Prev Frame (,)"
                >
                    <StepForwardIcon className="w-5 h-5 sm:w-4 sm:h-4 rotate-180" />
                </button>
                <button
                    onClick={onTogglePlay}
                    className="p-4 sm:p-3 bg-white text-black hover:bg-gray-200 transition-colors rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)] mx-1 transform active:scale-90 duration-150"
                    title="Play/Pause"
                >
                    {isPlaying ? <PauseIcon className="w-6 h-6 sm:w-5 sm:h-5 fill-current" /> : <PlayIcon className="w-6 h-6 sm:w-5 sm:h-5 fill-current" />}
                </button>
                <button
                    onClick={() => onStepFrame('forward')}
                    className="p-3 sm:p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full active:scale-90"
                    title="Next Frame (.)"
                >
                    <StepForwardIcon className="w-5 h-5 sm:w-4 sm:h-4" />
                </button>
            </div>

            {/* Right: Tools */}
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/5 shadow-lg">
                {/* Playback Speed Indicator */}
                {playbackRate !== 1 && (
                    <button
                        onClick={() => onPlaybackRateChange(1)}
                        className="px-2 py-1 text-[10px] font-bold bg-purple-600 text-white rounded-full hover:bg-purple-500 transition-colors"
                        title="Reset Speed"
                    >
                        {playbackRate}x
                    </button>
                )}

                {/* Bookmark Button */}
                <button onClick={onAddBookmark} className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-white/10 rounded-full transition-all" title="Add Bookmark (B)">
                    <span className="text-sm">🔖</span>
                </button>

                <button
                    onClick={onToggleStoryboard}
                    className={`p-2 rounded-full transition-all ${showStoryboard ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                    title="Toggle Storyboard"
                >
                    <ViewColumnsIcon className="w-4 h-4" />
                </button>

                {/* SHORTCUTS BUTTON (NEW) */}
                <button
                    onClick={onOpenShortcuts}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    title="Keyboard Shortcuts"
                >
                    <KeyboardIcon className="w-4 h-4" />
                </button>

                {/* Settings Menu */}
                <div ref={settingsRef} className="relative">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-full transition-all duration-300 ${showSettings ? 'bg-white/10 text-white rotate-90' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                        title="Settings"
                    >
                        <SettingsIcon className="w-4 h-4" />
                    </button>
                    {showSettings && (
                        <PlayerSettings
                            playbackRate={playbackRate}
                            onPlaybackRateChange={onPlaybackRateChange}
                            onClose={() => setShowSettings(false)}
                        />
                    )}
                </div>

                <button
                    onClick={onRequestPiP}
                    className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full"
                    title="Picture in Picture"
                >
                    <PictureInPictureIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={onToggleFullscreen}
                    className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full"
                    title="Fullscreen (f)"
                >
                    {isFullscreen ? <MinimizeIcon className="w-4 h-4" /> : <MaximizeIcon className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};
