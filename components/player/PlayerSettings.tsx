import React, { useState } from 'react';
import { GaugeIcon, ChevronRightIcon, ChevronLeftIcon, CheckIcon } from '../icons';

interface PlayerSettingsProps {
    playbackRate: number;
    onPlaybackRateChange: (rate: number) => void;
    onClose: () => void;
}

export const PlayerSettings: React.FC<PlayerSettingsProps> = ({ playbackRate, onPlaybackRateChange, onClose }) => {
    const [menuView, setMenuView] = useState<'main' | 'speed'>('main');

    return (
        <div className="absolute bottom-14 right-0 theme-bg-elevated theme-text rounded-xl w-60 shadow-[0_10px_40px_rgba(0,0,0,0.7)] theme-border border backdrop-blur-xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in z-50">
            {menuView === 'main' ? (
                <div className="p-1">
                    <button
                        onClick={() => setMenuView('speed')}
                        className="w-full px-3 py-2.5 hover:theme-bg-secondary rounded-lg flex items-center justify-between transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <GaugeIcon className="w-4 h-4 theme-text-brand" />
                            <span className="text-sm font-medium">Playback Speed</span>
                        </div>
                        <div className="flex items-center gap-1 theme-text-muted text-xs group-hover:theme-text">
                            <span>{playbackRate === 1 ? 'Normal' : playbackRate + 'x'}</span>
                            <ChevronRightIcon className="w-3 h-3" />
                        </div>
                    </button>
                    {/* Placeholder for future settings */}
                </div>
            ) : (
                <div className="p-1">
                    <div
                        className="px-3 py-2 mb-1 flex items-center gap-2 theme-text-muted cursor-pointer hover:theme-text hover:theme-bg-secondary rounded-lg transition-colors"
                        onClick={() => setMenuView('main')}
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                        <span className="text-sm font-bold">Speed</span>
                    </div>
                    <div className="h-px theme-border my-1 mx-2"></div>
                    <div className="max-h-48 overflow-y-auto">
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                            <button
                                key={rate}
                                onClick={() => { onPlaybackRateChange(rate); onClose(); }}
                                className={`w-full px-3 py-2 flex items-center gap-3 text-left transition-colors text-sm rounded-lg ${playbackRate === rate ? 'btn-primary' : 'hover:theme-bg-secondary'}`}
                            >
                                {playbackRate === rate && <CheckIcon className="w-3 h-3" />}
                                <span className={playbackRate === rate ? "ml-0" : "ml-6"}>{rate === 1 ? 'Normal' : rate + 'x'}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
