
import React from 'react';
import { KeyboardIcon } from './icons';

interface ShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const shortcuts = [
        { key: 'Space / K', action: 'Play / Pause Video' },
        { key: '← / →', action: 'Seek -/+ 5 seconds' },
        { key: ', (comma)', action: 'Step Backward (1 frame)' },
        { key: '. (period)', action: 'Step Forward (1 frame)' },
        { key: 'C / Enter', action: 'Capture Current Frame' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="theme-bg-elevated theme-card border theme-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-6 border-b theme-border pb-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <KeyboardIcon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold theme-text">Keyboard Shortcuts</h2>
                    <button
                        onClick={onClose}
                        className="ml-auto theme-text-muted hover:theme-text transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-3">
                    {shortcuts.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl theme-bg-secondary hover:theme-bg-elevated transition-colors border theme-border">
                            <span className="theme-text-secondary font-medium">{s.action}</span>
                            <code className="px-2 py-1 bg-black/40 border border-white/10 rounded text-xs font-mono text-indigo-300">
                                {s.key}
                            </code>
                        </div>
                    ))}
                </div>

                <div className="mt-6 text-center text-xs theme-text-muted">
                    Press <span className="font-bold theme-text">ESC</span> to close
                </div>
            </div>
        </div>
    );
};

export default ShortcutsModal;
