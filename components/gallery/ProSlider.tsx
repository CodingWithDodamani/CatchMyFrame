import React from 'react';
import { RotateCcwIcon } from '../icons';

export interface ProSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    defaultValue?: number;
    onChange: (val: number) => void;
    unit?: string;
}

export const ProSlider: React.FC<ProSliderProps> = ({ label, value, min, max, step = 1, defaultValue = 0, onChange, unit = '' }) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="group space-y-3">
            <div className="flex justify-between items-center text-xs tracking-wide">
                <span className="font-bold theme-text-muted group-hover:theme-text transition-colors uppercase text-[10px]">{label}</span>
                <div className="flex items-center gap-3">
                    {value !== defaultValue && (
                        <button
                            onClick={() => onChange(defaultValue)}
                            className="theme-text-muted hover:theme-text transition-colors"
                            title="Reset to default"
                        >
                            <RotateCcwIcon className="w-3 h-3" />
                        </button>
                    )}
                    <span className="text-indigo-400 font-mono font-bold text-[10px] bg-indigo-500/10 px-1.5 py-0.5 rounded">{value}{unit}</span>
                </div>
            </div>

            <div
                className="relative h-6 flex items-center select-none cursor-pointer group/track"
                style={{ '--slider-progress': `${percentage}%` } as React.CSSProperties}
            >
                {/* Track Background */}
                <div className="absolute w-full h-1 theme-bg-elevated rounded-full overflow-hidden">
                    {/* Center Marker for bipolar sliders if needed, here just fill from left */}
                    <div
                        className="absolute h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-75 group-hover/track:brightness-110 w-[var(--slider-progress)]"
                    ></div>
                </div>
                <input
                    type="range"
                    min={min} max={max} step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                    title={label}
                />
                <div
                    className="absolute h-4 w-4 theme-bg rounded-full shadow-[0_0_0_2px_rgba(99,102,241,1)] pointer-events-none transition-all duration-75 transform scale-75 group-hover/track:scale-100 left-[calc(var(--slider-progress)-8px)]"
                ></div>
            </div>
        </div>
    );
};
