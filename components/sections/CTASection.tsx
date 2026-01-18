
import React from 'react';
import { DiamondIcon, BrainCircuitIcon, ZapIcon } from '../icons';

interface CTASectionProps {
    onLaunch: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onLaunch }) => (
    <div className="container mx-auto px-4 py-24 relative z-20 pb-32">
        <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-to-br from-indigo-900/70 via-purple-900/50 to-blue-900/40 border border-indigo-500/30 p-12 md:p-20 text-center relative overflow-hidden group">

            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

            {/* Glossy top edge */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

            {/* Floating particles */}
            <div className="absolute top-10 left-10 w-3 h-3 bg-indigo-400 rounded-full animate-ping opacity-40"></div>
            <div className="absolute bottom-16 right-16 w-4 h-4 bg-purple-400 rounded-full animate-pulse opacity-50"></div>
            <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }}></div>

            {/* Icon decorations */}
            <div className="absolute top-8 left-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                <ZapIcon className="w-16 h-16 text-yellow-400" />
            </div>

            <h2 className="text-4xl md:text-6xl font-bold theme-text mb-6 relative z-10 leading-tight">
                Ready to Capture the<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient">Perfect Shot?</span>
            </h2>

            <p className="theme-text-secondary text-xl mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed">
                Start using the most advanced browser-based frame extraction tool today. No sign-up required, completely free.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <button
                    onClick={onLaunch}
                    className="group/btn px-12 py-5 bg-white text-indigo-950 font-bold rounded-2xl text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_60px_-5px_rgba(255,255,255,0.4)] flex items-center justify-center gap-3 relative overflow-hidden"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity"></span>
                    <span className="relative flex items-center gap-3">
                        <span className="text-xl">🚀</span> Launch Studio Now
                    </span>
                </button>
                <button className="px-12 py-5 bg-white/10 text-white font-bold rounded-2xl text-lg hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center justify-center gap-3 backdrop-blur-sm">
                    <span className="text-xl">📺</span> Watch Demo
                </button>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 p-16 opacity-10 transform translate-x-16 -translate-y-16 group-hover:rotate-12 transition-transform duration-1000">
                <DiamondIcon className="w-80 h-80 text-white" />
            </div>
            <div className="absolute bottom-0 left-0 p-12 opacity-10 transform -translate-x-16 translate-y-16 delay-100 group-hover:-rotate-12 transition-transform duration-1000">
                <BrainCircuitIcon className="w-64 h-64 text-indigo-400" />
            </div>
        </div>
    </div>
);
