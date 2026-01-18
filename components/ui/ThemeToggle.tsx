
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '../icons';

interface ThemeToggleProps {
    className?: string;
    showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative flex items-center justify-center gap-2 p-2 rounded-xl transition-all duration-300 hover:scale-105 ${className} ${isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-white/10'
                    : 'bg-gray-200 hover:bg-gray-300 text-indigo-600 border border-gray-300'
                }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            <span className="relative w-5 h-5 overflow-hidden">
                {/* Sun Icon - visible in dark mode */}
                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isDark ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
                    }`}>
                    <SunIcon className="w-5 h-5" />
                </span>
                {/* Moon Icon - visible in light mode */}
                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isDark ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'
                    }`}>
                    <MoonIcon className="w-5 h-5" />
                </span>
            </span>
            {showLabel && (
                <span className="text-sm font-medium">
                    {isDark ? 'Light' : 'Dark'}
                </span>
            )}
        </button>
    );
};

// Alternative: Animated Switch Style Toggle
export const ThemeToggleSwitch: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isDark ? 'bg-indigo-600' : 'bg-gray-300'
                } ${className}`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {/* Background Icons */}
            <span className="absolute inset-0 flex items-center justify-between px-1.5">
                <SunIcon className={`w-4 h-4 transition-opacity ${isDark ? 'opacity-30 text-white' : 'opacity-0'}`} />
                <MoonIcon className={`w-4 h-4 transition-opacity ${isDark ? 'opacity-0' : 'opacity-30 text-gray-600'}`} />
            </span>

            {/* Toggle Knob */}
            <span
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${isDark ? 'left-0.5' : 'left-7'
                    }`}
            >
                {isDark ? (
                    <MoonIcon className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                    <SunIcon className="w-3.5 h-3.5 text-yellow-500" />
                )}
            </span>
        </button>
    );
};

export default ThemeToggle;
