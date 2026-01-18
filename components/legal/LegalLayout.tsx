
import React from 'react';
import { LogoIcon } from '../icons';

interface LegalLayoutProps {
    title: string;
    lastUpdated: string;
    children: React.ReactNode;
    onBack: () => void;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ title, lastUpdated, children, onBack }) => {
    return (
        <div className="theme-bg theme-text min-h-screen font-sans selection:bg-indigo-500/30 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 theme-surface-glass backdrop-blur-md border-b theme-border-secondary">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <LogoIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold theme-text text-lg">Catch My <span className="text-indigo-400">Frame</span></span>
                    </div>
                    <button
                        onClick={onBack}
                        className="text-sm font-medium theme-text-secondary hover:theme-text hover:bg-white/5 px-4 py-2 rounded-lg transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-4xl animate-fade-in">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold theme-text mb-4 tracking-tight">{title}</h1>
                    <p className="theme-text-muted">Last Updated: {lastUpdated}</p>
                </div>

                <div className="prose prose-invert max-w-none theme-text-secondary prose-headings:theme-text prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-strong:theme-text">
                    {children}
                </div>
            </main>
        </div>
    );
};
