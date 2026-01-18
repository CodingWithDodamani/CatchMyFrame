import React, { useRef, useState, useEffect, useCallback } from 'react';
import { VideoIcon, PlayIcon, PauseIcon, FastForwardIcon, RewindIcon, VolumeMaxIcon, VolumeMuteIcon, SpinnerIcon, ViewColumnsIcon, SettingsIcon } from './icons';
import { PlayerControls } from './player/PlayerControls';
import { AutoCaptureMode } from '../types';

// (CheckIcon, ChevronRightIcon, ChevronLeftIcon moved to PlayerSettings or unused here now)
// Keeping them only if used elsewhere in this file, which they aren't.
// Removed unused icon components.

interface VideoPlayerProps {
    videoSrc: string | null;
    videoRef: React.RefObject<HTMLVideoElement>;
    isVideoReady: boolean;
    videoSourceType: 'file' | 'url' | null;
    videoDuration: number;
    videoCurrentTime: number;
    onSeek: (time: number) => void;
    onStepFrame: (direction: 'forward' | 'backward') => void;
    autoCaptureMode: AutoCaptureMode;
    timeRange: { start: number, end: number };
    playbackRate: number;
    onPlaybackRateChange: (rate: number) => void;
    timelineRange: { start: number, end: number };
    onZoom: (direction: 'in' | 'out') => void;
    zoomLevel: number;
    capturedFrameTimestamps?: number[]; // For frame markers on timeline

    onEnableScreenCapture?: () => void;
    isScreenCapturing?: boolean;
    supportsScreenCapture?: boolean;
    onOpenShortcuts?: () => void;
}

export default function VideoPlayer({
    videoSrc,
    videoRef,
    isVideoReady,
    videoSourceType,
    videoDuration,
    videoCurrentTime,
    onSeek,
    onStepFrame,
    playbackRate,
    onPlaybackRateChange,
    autoCaptureMode,
    timeRange,
    capturedFrameTimestamps = [],
    onEnableScreenCapture,
    isScreenCapturing = false,
    supportsScreenCapture = false,
    onOpenShortcuts
}: VideoPlayerProps) {

    // UI States
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // Storyboard State
    const [showStoryboard, setShowStoryboard] = useState(false);
    const [storyboardFrames, setStoryboardFrames] = useState<{ time: number, data: string }[]>([]);
    const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);


    // Bezel Animations
    const [bezelAction, setBezelAction] = useState<{ type: 'play' | 'pause' | 'forward' | 'rewind' | 'volume' | 'bookmark', id: number } | null>(null);
    const [doubleTapFeedback, setDoubleTapFeedback] = useState<{ side: 'left' | 'right', id: number } | null>(null);

    // Bookmark System
    const [bookmarks, setBookmarks] = useState<{ time: number; label: string }[]>([]);

    const addBookmark = useCallback(() => {
        if (!isVideoReady) return;
        const time = videoCurrentTime;
        // Avoid duplicates within 0.5s
        if (bookmarks.some(b => Math.abs(b.time - time) < 0.5)) return;
        const newBookmark = { time, label: `Bookmark ${bookmarks.length + 1}` };
        setBookmarks(prev => [...prev, newBookmark].sort((a, b) => a.time - b.time));
        setBezelAction({ type: 'bookmark', id: Date.now() });
    }, [isVideoReady, videoCurrentTime, bookmarks]);

    const removeBookmark = useCallback((time: number) => {
        setBookmarks(prev => prev.filter(b => b.time !== time));
    }, []);

    // Refs
    // const settingsRef = useRef<HTMLDivElement>(null); // Moved to PlayerControls
    const containerRef = useRef<HTMLDivElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const storyboardRef = useRef<HTMLDivElement>(null);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrubRafRef = useRef<number | null>(null);

    // Timeline / Scrubbing
    const previewVideoRef = useRef<HTMLVideoElement>(null);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const isScrubbingRef = useRef(false);
    const wasPlayingRef = useRef(false);
    const [localScrubTime, setLocalScrubTime] = useState(videoCurrentTime);
    const [hoverPreviewTime, setHoverPreviewTime] = useState<number | null>(null);

    // Scrubbing Logic State
    const scrubLogicRef = useRef({ startX: 0, startY: 0, startTime: 0, currentScrubTime: 0, width: 0 });

    // Tap Handling
    const lastTapTimeRef = useRef<number>(0);
    const lastTapZoneRef = useRef<'left' | 'right' | 'center' | null>(null);
    const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [gestureState, setGestureState] = useState<{ isDragging: boolean; startX: number; clickTimestamp: number }>({ isDragging: false, startX: 0, clickTimestamp: 0 });

    // --- EFFECT: Buffering & Play State ---
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onWaiting = () => setIsBuffering(true);
        const onPlaying = () => setIsBuffering(false);
        const onCanPlay = () => setIsBuffering(false);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('waiting', onWaiting);
        video.addEventListener('playing', onPlaying);
        video.addEventListener('canplay', onCanPlay);
        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('waiting', onWaiting);
            video.removeEventListener('playing', onPlaying);
            video.removeEventListener('canplay', onCanPlay);
        };
    }, [videoRef, videoSrc]);

    // --- EFFECT: High-Density Storyboard Generation ---
    useEffect(() => {
        if (!videoSrc || !isVideoReady || videoSourceType === 'url') {
            setStoryboardFrames([]);
            return;
        }

        const generateStoryboard = async () => {
            setIsGeneratingStoryboard(true);
            setGenerationProgress(0);
            const frames: { time: number, data: string }[] = [];

            // INCREASED DENSITY: Max 400 frames to provide smoother navigation
            const targetFps = videoDuration < 5 ? 30 : videoDuration < 20 ? 10 : 2;
            const count = Math.min(Math.floor(videoDuration * targetFps), 400);
            const interval = videoDuration / count;

            const ghostVideo = document.createElement('video');
            ghostVideo.src = videoSrc;
            ghostVideo.muted = true;
            ghostVideo.preload = 'auto';

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            await new Promise(r => ghostVideo.addEventListener('loadedmetadata', r, { once: true }));

            const epsilon = 0.001;

            for (let i = 0; i < count; i++) {
                const targetTime = i * interval;
                ghostVideo.currentTime = targetTime + epsilon;

                await new Promise(r => {
                    const onSeeked = () => {
                        ghostVideo.removeEventListener('seeked', onSeeked);
                        setTimeout(r, 10);
                    };
                    ghostVideo.addEventListener('seeked', onSeeked);
                });

                if (ctx) {
                    canvas.width = 180;
                    canvas.height = (ghostVideo.videoHeight / ghostVideo.videoWidth) * 180;
                    ctx.drawImage(ghostVideo, 0, 0, canvas.width, canvas.height);
                    frames.push({ time: targetTime, data: canvas.toDataURL('image/jpeg', 0.6) });
                    setGenerationProgress(Math.round(((i + 1) / count) * 100));
                    if (i % 8 === 0 || i === count - 1) setStoryboardFrames([...frames]);
                }
            }
            setIsGeneratingStoryboard(false);
        };

        generateStoryboard();
    }, [videoSrc, isVideoReady, videoDuration, videoSourceType]);

    // --- EFFECT: Precise Auto-scroll Centering ---
    useEffect(() => {
        if (!showStoryboard || !storyboardRef.current || storyboardFrames.length === 0) return;

        const activeIndex = storyboardFrames.findIndex((f, i) =>
            videoCurrentTime >= f.time && (i === storyboardFrames.length - 1 || videoCurrentTime < storyboardFrames[i + 1].time)
        );

        if (activeIndex !== -1) {
            const container = storyboardRef.current;
            const frames = container.children;
            const activeFrame = frames[activeIndex] as HTMLElement;

            if (activeFrame) {
                const scrollLeft = activeFrame.offsetLeft - (container.clientWidth / 2) + (activeFrame.clientWidth / 2);
                container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        }
    }, [videoCurrentTime, showStoryboard, storyboardFrames]);

    // --- EFFECT: UI Logic (Settings, Fullscreen, Volume) ---
    // (Settings click-outside logic moved to PlayerSettings/PlayerControls)
    // useEffect(() => {
    //     const handleClickOutside = (e: MouseEvent) => { if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) { setShowSettings(false); setSettingsMenu('main'); } };
    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => document.removeEventListener('mousedown', handleClickOutside);
    // }, []);

    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => { if (videoRef.current) videoRef.current.playbackRate = playbackRate; }, [playbackRate]);
    useEffect(() => { if (videoRef.current) { videoRef.current.volume = volume; videoRef.current.muted = isMuted; } }, [volume, isMuted, videoSrc]);

    // --- EFFECT: Scrubber Management ---
    useEffect(() => {
        const handleGlobalEnd = () => {
            if (isScrubbingRef.current) {
                setIsScrubbing(false);
                isScrubbingRef.current = false;
                setHoverPreviewTime(null);
                if (wasPlayingRef.current) videoRef.current?.play().catch(() => { });
                if (videoRef.current) onSeek(videoRef.current.currentTime);
            }
        };
        window.addEventListener('mouseup', handleGlobalEnd);
        window.addEventListener('touchend', handleGlobalEnd);
        return () => { window.removeEventListener('mouseup', handleGlobalEnd); window.removeEventListener('touchend', handleGlobalEnd); };
    }, [onSeek, videoRef]);

    useEffect(() => { if (!isScrubbing) setLocalScrubTime(videoCurrentTime); }, [videoCurrentTime, isScrubbing]);

    // --- TIMELINE / SCRUBBER LOGIC ---
    const updatePreviewVideo = (videoEl: HTMLVideoElement | null, time: number) => {
        if (!videoEl) return;
        const epsilon = 0.001;
        videoEl.currentTime = time + epsilon;
    };

    const handleTimelinePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        e.preventDefault(); e.stopPropagation();
        const element = e.currentTarget;
        element.setPointerCapture(e.pointerId);
        const rect = element.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newTime = percent * videoDuration;
        scrubLogicRef.current = { startX: e.clientX, startY: e.clientY, startTime: newTime, currentScrubTime: newTime, width: rect.width };
        setIsScrubbing(true);
        isScrubbingRef.current = true;
        setLocalScrubTime(newTime);
        wasPlayingRef.current = !videoRef.current?.paused;
        if (wasPlayingRef.current) videoRef.current?.pause();
        updatePreviewVideo(previewVideoRef.current, newTime);
        if (videoRef.current) videoRef.current.currentTime = newTime;
    };

    const handleTimelinePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const rawPercent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        let time = rawPercent * videoDuration;
        if (isScrubbingRef.current) {
            e.preventDefault();
            scrubLogicRef.current.currentScrubTime = time;
            setLocalScrubTime(time);
            if (scrubRafRef.current) cancelAnimationFrame(scrubRafRef.current);
            scrubRafRef.current = requestAnimationFrame(() => {
                updatePreviewVideo(previewVideoRef.current, time);
                if (videoRef.current) videoRef.current.currentTime = time;
            });
        } else {
            setHoverPreviewTime(time);
            if (scrubRafRef.current) cancelAnimationFrame(scrubRafRef.current);
            scrubRafRef.current = requestAnimationFrame(() => updatePreviewVideo(previewVideoRef.current, time));
        }
    };

    const handleTimelinePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isScrubbingRef.current) return;
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        setIsScrubbing(false);
        isScrubbingRef.current = false;
        if (wasPlayingRef.current) videoRef.current?.play().catch(() => { });
        if (videoRef.current) onSeek(scrubLogicRef.current.currentScrubTime);
    };

    // --- COMPONENT: Use PlayerControls ---
    // (Helper functions for controls remain the same, but JSX will be cleaner)
    const handleTogglePlay = () => togglePlayback();
    const handleStepFrame = (direction: 'forward' | 'backward') => onStepFrame(direction);
    const handleToggleMute = () => toggleMute();
    const handleVolumeChange = (val: number) => { setVolume(val); if (isMuted && val > 0) setIsMuted(false); };
    const handlePlaybackRateChange = (rate: number) => onPlaybackRateChange(rate);
    const handleAddBookmark = () => addBookmark();
    const handleToggleStoryboard = () => setShowStoryboard(!showStoryboard);
    const handleToggleFullscreen = () => toggleFullscreen();
    const handleRequestPiP = () => videoRef.current?.requestPictureInPicture();
    const handleOpenShortcuts = () => onOpenShortcuts && onOpenShortcuts();

    // --- PLAYBACK CONTROLS ---
    const togglePlayback = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        const video = videoRef.current;
        if (!video || !isVideoReady) return;
        if (video.paused) { video.play().catch(() => { }); setBezelAction({ type: 'play', id: Date.now() }); }
        else { video.pause(); setBezelAction({ type: 'pause', id: Date.now() }); }
    }, [videoRef, isVideoReady]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
        setBezelAction({ type: 'volume', id: Date.now() });
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) containerRef.current?.requestFullscreen().catch(() => { });
        else document.exitFullscreen().catch(() => { });
    };

    const seekRelative = (seconds: number) => {
        if (!videoRef.current) return;
        onSeek(videoRef.current.currentTime + seconds);
        setBezelAction({ type: seconds > 0 ? 'forward' : 'rewind', id: Date.now() });
    };

    const handleInteraction = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        // if (isPlaying && !showSettings) controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000); // showSettings logic is now internal to PlayerControls, might need a callback to pause auto-hide, but for now simple auto-hide is fine or we can pass a "menusOpen" state up.
        // For simplicity, we'll just auto-hide after 3s unless interaction continues
        if (isPlaying) controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }, [isPlaying]);

    // --- GESTURES ---
    const handleGestureStart = (clientX: number) => { if (!isVideoReady) return; setGestureState({ isDragging: true, startX: clientX, clickTimestamp: Date.now() }); };
    const handleGestureEnd = (clientX: number | null, e?: React.TouchEvent | React.MouseEvent) => {
        if (!gestureState.isDragging || !videoRef.current || !containerRef.current) return;
        const now = Date.now();
        const timeDiff = now - gestureState.clickTimestamp;
        let pixelDiff = 0, relativeX = 0;
        if (clientX !== null) {
            pixelDiff = Math.abs(clientX - gestureState.startX);
            const rect = containerRef.current.getBoundingClientRect();
            relativeX = clientX - rect.left;
        }
        const isTap = timeDiff < 300 && pixelDiff < 30;
        if (isTap && clientX !== null) {
            const containerWidth = containerRef.current.clientWidth;
            const currentZone = relativeX < containerWidth * 0.2 ? 'left' : relativeX > containerWidth * 0.8 ? 'right' : 'center';
            if (now - lastTapTimeRef.current < 400 && lastTapZoneRef.current === currentZone) {
                if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
                if (currentZone === 'left') { seekRelative(-10); setDoubleTapFeedback({ side: 'left', id: now }); }
                else if (currentZone === 'right') { seekRelative(10); setDoubleTapFeedback({ side: 'right', id: now }); }
                else toggleFullscreen();
                lastTapTimeRef.current = 0; lastTapZoneRef.current = null;
            } else {
                lastTapTimeRef.current = now; lastTapZoneRef.current = currentZone;
                if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
                if (currentZone === 'center') tapTimeoutRef.current = setTimeout(() => { togglePlayback(); lastTapTimeRef.current = 0; }, 300);
                else setShowControls(true);
            }
        }
        setGestureState({ isDragging: false, startX: 0, clickTimestamp: 0 });
    };

    // --- HELPER RENDERS ---
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const getTooltipPosition = () => {
        const percent = ((isScrubbing ? localScrubTime : (hoverPreviewTime ?? 0)) / videoDuration * 100);
        const halfWidth = 80;
        return { left: `clamp(${halfWidth}px, ${percent}%, calc(100% - ${halfWidth}px))`, transform: 'translateX(-50%)' };
    };

    if (!videoSrc) return (
        <div className="w-full max-w-3xl mx-auto h-56 theme-bg-card theme-surface-glass theme-border border rounded-2xl flex flex-col items-center justify-center theme-text-muted animate-fade-in shadow-2xl">
            <VideoIcon className="w-12 h-12 mb-3 opacity-20" />
            <h3 className="text-base font-bold theme-text">No Video Loaded</h3>
            <p className="text-sm theme-text-muted mt-1">Select a source above to begin</p>
        </div>
    );

    if (videoSourceType === 'url') return (
        <div className="w-full max-w-4xl mx-auto">
            <iframe src={videoSrc} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="YouTube video player" className="w-full aspect-video rounded-xl bg-black shadow-2xl theme-border border border-white/10"></iframe>
            <div className="mt-4 p-4 theme-bg-secondary theme-border border rounded-xl flex items-start gap-4">
                <div className={`p-2 rounded-lg ${isScreenCapturing ? 'bg-green-500/20 text-green-400' : 'theme-bg-elevated theme-text-brand'}`}>
                    {isScreenCapturing ? <div className="w-5 h-5 animate-pulse rounded-full bg-green-500" /> : <ViewColumnsIcon className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm theme-text flex items-center gap-2">
                        {isScreenCapturing ? 'Screen Capture Active' : 'External Player Mode'}
                        {isScreenCapturing && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">LIVE</span>}
                    </h4>
                    <p className="text-xs theme-text-secondary mt-1">
                        {isScreenCapturing
                            ? "Capturing from screen stream. Use the Capture buttons below!" // Fixed typo 'form' -> 'from'
                            : supportsScreenCapture
                                ? "Direct capture is limited. Enable Screen Capture to grab frames from YouTube."
                                : "Screen Capture is not supported on this device. Please use a Desktop or upload a file directly."}
                    </p>

                    {!isScreenCapturing && onEnableScreenCapture && supportsScreenCapture && (
                        <button
                            onClick={onEnableScreenCapture}
                            className="mt-3 px-4 py-2 btn-primary text-xs font-bold rounded-lg transition-all shadow-lg flex items-center gap-2"
                        >
                            <span>Enable Capture</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const percent = videoDuration > 0 ? ((isScrubbing ? localScrubTime : videoCurrentTime) / videoDuration) * 100 : 0;
    const activePreviewTime = isScrubbing ? localScrubTime : (hoverPreviewTime ?? 0);
    const showPreview = isScrubbing || hoverPreviewTime !== null;
    const isRangeActive = autoCaptureMode === 'timeRange';
    const rangeStartPercent = (timeRange.start / videoDuration) * 100;
    const rangeEndPercent = (timeRange.end / videoDuration) * 100;

    return (
        <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-[60] bg-black flex items-center justify-center' : ''}`}>
            <div
                ref={containerRef}
                className={`w-full group/video relative bg-black select-none overflow-hidden ${isFullscreen ? 'h-full' : 'shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl theme-border border border-white/10'}`}
                onMouseDown={(e) => { if ((e.target as HTMLElement).closest('.controls-layer')) return; handleGestureStart(e.clientX); }}
                onMouseMove={() => handleInteraction()}
                onMouseUp={(e) => { if ((e.target as HTMLElement).closest('.controls-layer')) return; handleGestureEnd(e.clientX, e); }}
                onMouseLeave={() => { handleInteraction(); handleGestureEnd(null); }}
                onTouchStart={(e) => { if ((e.target as HTMLElement).closest('.controls-layer')) return; handleGestureStart(e.touches[0].clientX); }}
                onTouchEnd={(e) => { if ((e.target as HTMLElement).closest('.controls-layer')) return; handleGestureEnd(e.changedTouches[0] ? e.changedTouches[0].clientX : null, e); }}
            >
                <video ref={videoRef} src={videoSrc} playsInline className={`w-full h-full object-contain pointer-events-none ${isFullscreen ? '' : 'max-h-[75vh]'}`} />

                {/* Central Overlay Icons (Bezel) */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                    {isBuffering && <div className="bg-black/40 p-5 rounded-full backdrop-blur-xl animate-in fade-in zoom-in duration-300"><SpinnerIcon className="w-12 h-12 text-white animate-spin" /></div>}
                    {bezelAction && !isBuffering && (
                        <div key={bezelAction.id} className="absolute flex flex-col items-center justify-center animate-bezel-ping">
                            <div className="bg-black/60 p-6 rounded-full backdrop-blur-xl border border-white/10 text-white shadow-2xl">
                                {bezelAction.type === 'play' && <PlayIcon className="w-10 h-10 fill-current" />}
                                {bezelAction.type === 'pause' && <PauseIcon className="w-10 h-10 fill-current" />}
                                {bezelAction.type === 'forward' && <FastForwardIcon className="w-10 h-10 fill-current" />}
                                {bezelAction.type === 'rewind' && <RewindIcon className="w-10 h-10 fill-current" />}
                                {bezelAction.type === 'volume' && (isMuted ? <VolumeMuteIcon className="w-10 h-10" /> : <VolumeMaxIcon className="w-10 h-10" />)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Gradient for Contrast */}
                <div className={`absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none transition-opacity duration-500 z-10 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`} />

                {/* Controls Layer */}
                <div className={`controls-layer absolute inset-x-0 bottom-0 z-40 px-4 pb-4 transition-all duration-300 ${showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>

                    {/* Storyboard Filmstrip */}
                    {showStoryboard && (
                        <div className="mb-4 relative animate-in slide-in-from-bottom-4 duration-300">
                            {isGeneratingStoryboard && (
                                <div className="absolute -top-8 left-0 right-0 flex items-center justify-center">
                                    <div className="bg-black/80 text-brand-blue text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-2 shadow-lg">
                                        <SpinnerIcon className="w-3 h-3 animate-spin" />
                                        <span>ANALYZING REEL {generationProgress}%</span>
                                    </div>
                                </div>
                            )}
                            <div
                                ref={storyboardRef}
                                className="flex items-center gap-0.5 p-1 bg-black/60 backdrop-blur-xl rounded-xl border border-white/10 overflow-x-auto scrollbar-hide snap-x h-28 mask-linear-fade"
                                style={{ scrollBehavior: 'smooth' }}
                            >
                                {storyboardFrames.length === 0 && isGeneratingStoryboard ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-500 gap-2 italic">Generating previews...</div>
                                ) : (
                                    storyboardFrames.map((f, i) => {
                                        const isActive = videoCurrentTime >= f.time && (i === storyboardFrames.length - 1 || videoCurrentTime < storyboardFrames[i + 1].time);
                                        return (
                                            <div key={i} onClick={() => onSeek(f.time)} className={`relative flex-shrink-0 w-44 aspect-video bg-gray-900 cursor-pointer group/frame transition-all duration-300 snap-center overflow-hidden rounded-lg ${isActive ? 'z-10 scale-105 shadow-[0_0_20px_rgba(59,130,246,0.6)] ring-2 ring-brand-blue' : 'opacity-60 hover:opacity-100 hover:scale-105 hover:z-10 grayscale hover:grayscale-0'}`}>
                                                <img src={f.data} className="w-full h-full object-cover" alt={`Frame ${i}`} />
                                                <div className={`absolute bottom-0 inset-x-0 text-[8px] font-mono text-center bg-black/80 text-white py-0.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover/frame:opacity-100'}`}>{formatTime(f.time)}</div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div ref={timelineRef} className={`group/timeline relative w-full h-1.5 hover:h-2.5 transition-all duration-200 cursor-pointer flex items-end mb-4 select-none touch-none ease-out rounded-full overflow-visible`}>
                        <div className="absolute bottom-0 w-full z-50 cursor-pointer touch-none -top-3 h-8" onPointerDown={handleTimelinePointerDown} onPointerMove={handleTimelinePointerMove} onPointerUp={handleTimelinePointerUp} onPointerCancel={handleTimelinePointerUp} onPointerLeave={() => { if (!isScrubbing) setHoverPreviewTime(null); }}></div>
                        <div className="w-full h-full bg-white/10 rounded-full relative overflow-hidden pointer-events-none backdrop-blur-sm">
                            {/* Range Highlight */}
                            {isRangeActive && <div className="absolute inset-y-0 bg-indigo-500/30 border-x border-indigo-400/50 z-0" style={{ left: `${rangeStartPercent}%`, width: `${rangeEndPercent - rangeStartPercent}%` }}></div>}
                            {/* Buffered */}
                            {videoRef.current && videoRef.current.buffered.length > 0 && <div className="absolute inset-y-0 left-0 bg-white/20" style={{ width: `${(videoRef.current.buffered.end(videoRef.current.buffered.length - 1) / videoDuration) * 100}%` }}></div>}
                            {/* Progress */}
                            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-white shadow-[0_0_10px_rgba(255,255,255,0.5)] z-10" style={{ width: `${percent}%` }}></div>
                        </div>

                        {/* Range Handles */}
                        {isRangeActive && (
                            <>
                                <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-indigo-400 z-20 pointer-events-none" style={{ left: `${rangeStartPercent}%` }}></div>
                                <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-indigo-400 z-20 pointer-events-none" style={{ left: `${rangeEndPercent}%` }}></div>
                            </>
                        )}

                        {/* Bookmark Markers */}
                        {bookmarks.map((bookmark, i) => (
                            <div
                                key={`bookmark-${i}`}
                                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full z-25 cursor-pointer hover:scale-150 transition-transform shadow-lg border border-black/20"
                                style={{ left: `${(bookmark.time / videoDuration) * 100}%`, marginLeft: '-4px' }}
                                onClick={(e) => { e.stopPropagation(); onSeek(bookmark.time); }}
                                onContextMenu={(e) => { e.preventDefault(); removeBookmark(bookmark.time); }}
                                title={`${bookmark.label} (${formatTime(bookmark.time)}) - Right-click to delete`}
                            />
                        ))}



                        {/* Captured Frame Markers */}
                        {capturedFrameTimestamps.map((time, i) => (
                            <div
                                key={`frame-${i}`}
                                className="absolute top-0 w-0.5 h-full bg-emerald-400/60 z-15 pointer-events-none"
                                style={{ left: `${(time / videoDuration) * 100}%` }}
                                title={`Frame at ${formatTime(time)}`}
                            />
                        ))}

                        {/* Scrubber Knob */}
                        <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transform transition-transform duration-200 pointer-events-none z-30 flex items-center justify-center ${isScrubbing || showPreview ? 'scale-100' : 'scale-0 group-hover/timeline:scale-100'}`} style={{ left: `${percent}%`, marginLeft: '-8px' }}>
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                        </div>

                        {/* Hover Preview Tooltip */}
                        <div className={`absolute flex flex-col items-center pointer-events-none z-[60] transition-all duration-200 bottom-8 opacity-100`} style={{ ...getTooltipPosition(), opacity: showPreview ? 1 : 0, visibility: showPreview ? 'visible' : 'hidden', transform: `translateX(-50%) scale(${showPreview ? 1 : 0.8})` }}>
                            <div className={`relative bg-black rounded-lg overflow-hidden border border-white/20 shadow-2xl`}>
                                <div className="w-40 aspect-video bg-gray-900 relative"><video ref={previewVideoRef} src={videoSrc || ""} className="w-full h-full object-cover" muted playsInline preload="auto" disablePictureInPicture /></div>
                                <div className="absolute bottom-0 inset-x-0 text-center bg-black/70 pt-1 pb-1 backdrop-blur-md"><span className="text-xs font-mono font-bold text-white">{formatTime(activePreviewTime)}</span></div>
                            </div>
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white/20 mt-[-1px]"></div>
                        </div>
                    </div>

                    {/* Main Controls Dock using Sub-component */}
                    <div className="w-full">
                        <PlayerControls
                            currentTime={videoCurrentTime}
                            duration={videoDuration}
                            isPlaying={isPlaying}
                            isMuted={isMuted}
                            volume={volume}
                            playbackRate={playbackRate}
                            isFullscreen={isFullscreen}
                            showStoryboard={showStoryboard}
                            onTogglePlay={handleTogglePlay}
                            onStepFrame={handleStepFrame}
                            onToggleMute={handleToggleMute}
                            onVolumeChange={handleVolumeChange}
                            onPlaybackRateChange={handlePlaybackRateChange}
                            onAddBookmark={handleAddBookmark}
                            onToggleStoryboard={handleToggleStoryboard}
                            onToggleFullscreen={handleToggleFullscreen}
                            onRequestPiP={handleRequestPiP}
                            onOpenShortcuts={handleOpenShortcuts}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
