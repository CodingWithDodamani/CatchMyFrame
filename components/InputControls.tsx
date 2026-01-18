import React, { useRef, useState } from 'react';
import { UploadIcon, LinkIcon, WifiOffIcon, FilmIcon } from './icons';
import { useToast } from './context/ToastContext';

interface InputControlsProps {
    onVideoLoad: (file: File) => void;
    onUrlLoad: (url: string) => void;
    isLoading: boolean;
    loadingProgress: number;
    videoSourceType: 'file' | 'url' | null;
    isOnline: boolean;
}

const InputControls: React.FC<InputControlsProps> = ({ onVideoLoad, onUrlLoad, isLoading, loadingProgress, videoSourceType, isOnline }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [url, setUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);


    const { addToast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            validateAndLoad(file);
        }
    };

    const validateAndLoad = (file: File) => {
        const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
        if (file.size > maxSize) {
            addToast("File is too large (max 2GB). Please try a smaller video.", 'error');
            return;
        }
        onVideoLoad(file);
    };

    const handleLocalFileClick = () => {
        fileInputRef.current?.click();
    }

    const handleUrlLoadClick = () => {
        if (url.trim()) {
            onUrlLoad(url);
        }
    }

    const isFileLoading = isLoading && videoSourceType === 'file';

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!isLoading) setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (isLoading) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('video/')) {
                validateAndLoad(file);
                e.dataTransfer.clearData();
            } else {
                addToast('Please drop a valid video file.', 'error');
            }
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto animate-fade-in space-y-4">
            {/* Compact Drop Zone */}
            <div
                className={`relative group cursor-pointer transition-all duration-300 ${isDragging ? 'scale-[1.02]' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={handleLocalFileClick}
            >
                {/* Gradient Border Effect */}
                <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r transition-opacity duration-300 ${isDragging ? 'from-indigo-500 via-purple-500 to-pink-500 opacity-100' : 'from-gray-700 via-gray-600 to-gray-700 opacity-50 group-hover:opacity-100'}`} />

                <div className="relative theme-card rounded-2xl p-5 border theme-border">
                    <div className="flex items-center gap-5">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isDragging ? 'bg-[var(--brand-primary-light)] text-[var(--brand-primary)]' : 'theme-bg-secondary theme-text-secondary group-hover:theme-text group-hover:theme-bg-elevated'}`}>
                            {isFileLoading ? (
                                <div className="relative flex items-center justify-center">
                                    <svg className="animate-spin w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            ) : (
                                <UploadIcon className="w-6 h-6" />
                            )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold theme-text truncate">
                                {isDragging ? '✨ Release to upload' : isFileLoading ? `Loading... ${Math.round(loadingProgress)}%` : 'Drop video or click to browse'}
                            </h3>
                            <p className="text-xs theme-text-secondary mt-0.5">
                                MP4, MOV, WEBM · <span className="text-emerald-500/80">Private & secure</span>
                            </p>
                        </div>

                        {/* Action */}
                        <div className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${isDragging ? 'btn-primary' : 'theme-bg-secondary theme-text-secondary group-hover:theme-bg-elevated group-hover:theme-text'}`}>
                            {isFileLoading ? `${Math.round(loadingProgress)}%` : 'Browse'}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {isFileLoading && (
                        /* eslint-disable-next-line react-dom/no-unsafe-innerhtml */
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800 rounded-b-2xl overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${loadingProgress}%` }} />
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    accept="video/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                    title="Upload Video"
                />
            </div>


            {/* URL Input Section */}
            <div className="flex flex-col gap-2 relative">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <LinkIcon className={`w-5 h-5 ${isOnline ? 'text-gray-500' : 'text-gray-700'}`} />
                    </div>
                    <input
                        type="text"
                        placeholder={isOnline ? "Paste YouTube URL or direct link (mp4, webm)..." : "Video URLs require internet connection"}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isLoading || !isOnline}
                        className="w-full pl-12 pr-24 py-3 theme-input theme-border border rounded-xl theme-text placeholder-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        title="Video URL"
                    />
                    <div className="absolute inset-y-1.5 right-1.5">
                        <button
                            onClick={handleUrlLoadClick}
                            disabled={isLoading || !url.trim() || !isOnline}
                            className="h-full px-5 theme-bg-secondary hover:theme-bg-elevated theme-text-secondary hover:theme-text text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:theme-bg-secondary"
                        >
                            Load
                        </button>
                    </div>
                </div>
                {!isOnline && (
                    <div className="flex items-center gap-2 text-xs text-red-500/80 pl-2">
                        <WifiOffIcon className="w-3 h-3" />
                        <span>Internet connection required</span>
                    </div>
                )}
            </div>
        </div >
    );
};

export default InputControls;
