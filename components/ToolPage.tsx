
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CapturedFrame, AutoCaptureMode, FilterConfig } from '../types';
import InputControls from './InputControls';
import VideoPlayer from './VideoPlayer';
import FrameGallery from './FrameGallery';
import AutoCapturePanel from './AutoCapturePanel';
import SettingsModal, { AppSettings } from './SettingsModal';
import ShortcutsModal from './ShortcutsModal';
import OnboardingOverlay from './OnboardingOverlay';
import { ThemeToggle } from './ui/ThemeToggle';
import { LogoIcon } from './icons';
import { injectDpi } from '../utils';
import { useToast } from './context/ToastContext';
import {
    Settings2,
    Upload,
    WifiOff,
    Wifi,
    Camera,
    Timer,
    Video,
    ChevronDown,
    ChevronUp,
    Keyboard,
    CircleHelp,
    Aperture,
    Sparkles
} from 'lucide-react';


const ToolPage: React.FC = () => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [videoSourceType, setVideoSourceType] = useState<'file' | 'url' | null>(null);
    const [capturedFrames, setCapturedFrames] = useState<CapturedFrame[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingProgress, setLoadingProgress] = useState<number>(0);
    const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
    const [isAutoCapturing, setIsAutoCapturing] = useState<boolean>(false);
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
    const [autoCaptureMode, setAutoCaptureMode] = useState<AutoCaptureMode>('off');
    const [timeRange, setTimeRange] = useState({ start: 0, end: 0 });
    const [rangeThumbnails, setRangeThumbnails] = useState<{ start: string | null, end: string | null }>({ start: null, end: null });
    // Sensitivity and AI status
    const [aiStatus, setAiStatus] = useState<string>('Idle');
    const [isFastScanEnabled, setIsFastScanEnabled] = useState(true);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

    // Unified App Settings (Persisted)
    const [settings, setSettings] = useState<AppSettings>({
        quality: 'high',
        filenameFormat: 'timestamp',
        fps: 5,
        dpi: 1200,
        exportFormat: 'jpeg',
        sceneDetectSensitivity: 25,
        aiSceneDetectSensitivity: 50
    });
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [captureDuration, setCaptureDuration] = useState<number | null>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [timelineRange, setTimelineRange] = useState<{ start: number, end: number }>({ start: 0, end: 0 });

    // UI State for workflow management
    const [showInputControls, setShowInputControls] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showAutoCapturePanel, setShowAutoCapturePanel] = useState(true);

    const { addToast } = useToast();

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneDetectCanvasRef = useRef<HTMLCanvasElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const autoCaptureIntervalRef = useRef<number | null>(null);
    const lastFrameDataUrlRef = useRef<string | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastSceneFrameDataRef = useRef<Uint8ClampedArray | null>(null);
    const lastAiAnalyzedFrameRef = useRef<string | null>(null);
    const isAutoCapturingRef = useRef(isAutoCapturing);
    const frameSequenceRef = useRef(1);
    const captureStartTimeRef = useRef<number | null>(null);
    const screenVideoRef = useRef<HTMLVideoElement>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const [isScreenCapturing, setIsScreenCapturing] = useState(false);

    // Slide Mode Refs & State
    const [isSlideModeEnabled, setIsSlideModeEnabled] = useState(false);
    const slideStabilizationTimerRef = useRef<number | null>(null);
    const slideCooldownTimerRef = useRef<number | null>(null);
    const isSlideStabilizingRef = useRef(false);
    const isSlideCooldownRef = useRef(false);

    const [showOnboarding, setShowOnboarding] = useState(false);

    // Feature Detection
    const supportsScreenCapture = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;

    // Check Onboarding
    useEffect(() => {
        const hasSeen = localStorage.getItem('fg-hasSeenOnboarding');
        if (!hasSeen) {
            setShowOnboarding(true);
        }
    }, []);

    const handleCloseOnboarding = () => {
        localStorage.setItem('fg-hasSeenOnboarding', 'true');
        setShowOnboarding(false);
    };

    // Online/Offline Listener
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Load Settings
    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem('frameGrabberSettings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                // Merge with defaults to ensure new fields are present
                setSettings(prev => ({ ...prev, ...parsedSettings }));
            }
        } catch (error) {
            console.error("Could not load settings from localStorage", error);
        }
    }, []);

    // Save Settings
    useEffect(() => {
        localStorage.setItem('frameGrabberSettings', JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        try {
            localStorage.setItem('frameGrabberSettings', JSON.stringify(settings));
        } catch (error) {
            console.error("Could not save settings to localStorage", error);
        }
    }, [settings]);

    useEffect(() => {
        isAutoCapturingRef.current = isAutoCapturing;
    }, [isAutoCapturing]);

    useEffect(() => {
        if (videoFile && videoSourceType === 'file') {
            setIsLoading(true);
            setIsVideoReady(false);
            setLoadingProgress(0);
            const url = URL.createObjectURL(videoFile);
            setVideoSrc(url);

            // Reset range thumbs on new file
            setRangeThumbnails({ start: null, end: null });

            // Workflow: Collapse input when a file is selected
            setShowInputControls(false);

            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [videoFile, videoSourceType]);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement || videoSourceType !== 'file') return;

        const handleLoaded = () => {
            setLoadingProgress(100);
            setIsLoading(false);
            setIsVideoReady(true);
            if (videoElement) {
                setVideoDuration(videoElement.duration);
                setTimeRange({ start: 0, end: videoElement.duration });
                setTimelineRange({ start: 0, end: videoElement.duration });
                setZoomLevel(1);
            }
        };

        const handleProgress = () => {
            if (videoElement.duration > 0 && videoElement.buffered.length > 0) {
                const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
                const progress = (bufferedEnd / videoElement.duration) * 100;
                setLoadingProgress(progress);
            }
        }

        videoElement.addEventListener('loadedmetadata', handleLoaded);
        videoElement.addEventListener('progress', handleProgress);

        return () => {
            videoElement.removeEventListener('loadedmetadata', handleLoaded);
            videoElement.removeEventListener('progress', handleProgress);
        };
    }, [videoSrc, videoSourceType]);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement || !isVideoReady) return;

        const handleTimeUpdate = () => {
            setVideoCurrentTime(videoElement.currentTime);
        };

        videoElement.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        }
    }, [isVideoReady]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate, videoSrc]);

    useEffect(() => {
        return () => {
            stopAllCapturing();
            stopScreenCapture();
        };
    }, []);

    const stopAllCapturing = useCallback(() => {
        if (captureStartTimeRef.current) {
            setCaptureDuration(Date.now() - captureStartTimeRef.current);
            captureStartTimeRef.current = null;
        }
        if (autoCaptureIntervalRef.current) {
            clearInterval(autoCaptureIntervalRef.current);
            autoCaptureIntervalRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        setIsAutoCapturing(false);
        setAiStatus('Idle');
    }, []);

    useEffect(() => {
        if (videoSrc) {
            stopAllCapturing();
            lastFrameDataUrlRef.current = null;
        }
    }, [videoSrc, stopAllCapturing]);

    const handleVideoLoad = (file: File) => {
        setCapturedFrames([]);
        setVideoSourceType('file');
        setVideoFile(file);
        setVideoDuration(0);
        setVideoCurrentTime(0);
        setCaptureDuration(null);
        frameSequenceRef.current = 1;
        setShowInputControls(false);
    };

    const handleUrlLoad = (url: string) => {
        // 1. Check for Direct Video Files (MP4, WEBM, MOV)
        const directVideoRegex = /\.(mp4|webm|mov|m4v)($|\?)/i;
        if (directVideoRegex.test(url)) {
            setCapturedFrames([]);
            setVideoFile(null);
            setVideoSourceType('file'); // Treat as file to use standard player
            setVideoSrc(url);
            setIsLoading(false);
            setIsVideoReady(false);
            setVideoDuration(0);
            setVideoCurrentTime(0);
            setCaptureDuration(null);
            frameSequenceRef.current = 1;
            setShowInputControls(false);
            return;
        }

        // 2. Check for YouTube
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|watch)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
        const match = url.match(youtubeRegex);

        if (match && match[1]) {
            const videoId = match[1];
            setCapturedFrames([]);
            setVideoFile(null);
            setIsLoading(false);
            setIsVideoReady(false);
            setVideoDuration(0);
            setVideoCurrentTime(0);
            setCaptureDuration(null);
            frameSequenceRef.current = 1;
            setShowInputControls(false);

            // AUTO-PROXY LOGIC:
            // User requested "Local Video"-like capture on Desktop too.
            // We now default to the Vercel Proxy for ALL devices.
            // This enables native capture without Screen Share permissions.

            // Use our new Vercel Proxy
            const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
            setVideoSourceType('file'); // Treat as file (native player)
            setVideoSrc(proxyUrl);
            addToast("Using Proxy Mode (Beta) - Native Capture Enabled", 'info');

            /* Legacy Embed Mode (Fallback reference)
            setVideoSourceType('url');
            setVideoSrc(`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`);
            */
        } else {
            alert('Invalid URL. Please enter a YouTube link or a direct video file (MP4/WebM).');
        }
    };

    const startScreenCapture = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'browser' }, audio: false });
            if (screenVideoRef.current) {
                screenVideoRef.current.srcObject = stream;
                screenVideoRef.current.play();
                setIsScreenCapturing(true);
                screenStreamRef.current = stream;

                // Handle stream stop (user clicks "Stop sharing")
                stream.getVideoTracks()[0].onended = () => {
                    stopScreenCapture();
                };
            }
        } catch (err) {
            console.error("Screen capture cancelled or failed:", err);
        }
    };

    const stopScreenCapture = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
        }
        if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = null;
        }
        setIsScreenCapturing(false);
    };

    const formatTimeForFilename = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00-00-00-000';
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        const milliseconds = Math.floor((timeInSeconds * 1000) % 1000);
        return `${String(minutes).padStart(2, '0')}-${String(seconds).padStart(2, '0')}-${String(milliseconds).padStart(3, '0')}`;
    };

    const generateFilename = useCallback(() => {
        const videoName = videoFile?.name.substring(0, videoFile.name.lastIndexOf('.')) || 'video';
        const fileExtension = settings.quality === 'high' ? 'png' : 'jpeg';
        let baseName = '';
        switch (settings.filenameFormat) {
            case 'sequence':
                baseName = `${videoName}_frame_${String(frameSequenceRef.current).padStart(4, '0')}`;
                frameSequenceRef.current += 1;
                break;
            case 'videoTime':
                const currentTime = videoRef.current?.currentTime ?? 0;
                baseName = `${videoName}_${formatTimeForFilename(currentTime)}`;
                break;
            case 'timestamp':
            default:
                baseName = `frame_${Date.now()}`;
                break;
        }
        return `${baseName}.${fileExtension}`;
    }, [settings, videoFile]);

    const handleCaptureFrame = useCallback(() => {
        const sourceVideo = isScreenCapturing ? screenVideoRef.current : videoRef.current;
        const canvas = canvasRef.current;

        // Ensure source is ready
        if (!sourceVideo || !canvas) return;
        if (!isScreenCapturing && (!isVideoReady || videoSourceType !== 'file')) return;

        canvas.width = sourceVideo.videoWidth;
        canvas.height = sourceVideo.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            try {
                ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);
                let dataUrl = settings.quality === 'high'
                    ? canvas.toDataURL('image/png')
                    : canvas.toDataURL('image/jpeg', 0.92);

                dataUrl = injectDpi(dataUrl, settings.dpi);

                // Debounce duplicates if auto-capturing
                if (isAutoCapturingRef.current && dataUrl === lastFrameDataUrlRef.current) return;
                lastFrameDataUrlRef.current = dataUrl;

                const filename = generateFilename();
                const currentTime = isScreenCapturing ? Date.now() / 1000 : sourceVideo.currentTime;

                const defaultFilters: FilterConfig = {
                    brightness: 100, contrast: 100, saturation: 100,
                    blur: 0, grayscale: 0, sepia: 0, sharpening: 'low', dpi: settings.dpi
                };

                const newFrame: CapturedFrame = {
                    id: `frame-${Date.now()}`,
                    dataUrl,
                    fileExtension: settings.quality === 'high' ? 'png' : 'jpeg',
                    filename,
                    timestamp: currentTime,
                    filters: defaultFilters
                };

                setCapturedFrames(prevFrames => [newFrame, ...prevFrames]);

                if (!isAutoCapturingRef.current) {
                    addToast('Frame captured!', 'success');
                }
            } catch (e) {
                console.error("Capture failed:", e);
                addToast('Capture failed. Content might be protected.', 'error');
            }
        }
    }, [isVideoReady, videoSourceType, settings.quality, settings.dpi, generateFilename, addToast, isScreenCapturing, settings.filters]);

    const analyzePixelChange = useCallback(() => {
        const sourceVideo = isScreenCapturing ? screenVideoRef.current : videoRef.current;
        const canvas = sceneDetectCanvasRef.current;
        if (!sourceVideo || !canvas || (!isScreenCapturing && (sourceVideo.paused || sourceVideo.ended))) {
            stopAllCapturing();
            return;
        }
        const scale = 0.1;
        canvas.width = sourceVideo.videoWidth * scale;
        canvas.height = sourceVideo.videoHeight * scale;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);
        const currentFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        if (lastSceneFrameDataRef.current) {
            let diff = 0;
            for (let i = 0; i < currentFrameData.length; i += 4) {
                diff += Math.abs(currentFrameData[i] - lastSceneFrameDataRef.current[i]);
                diff += Math.abs(currentFrameData[i + 1] - lastSceneFrameDataRef.current[i + 1]);
                diff += Math.abs(currentFrameData[i + 2] - lastSceneFrameDataRef.current[i + 2]);
            }
            const avgDiff = diff / (currentFrameData.length * 0.75);
            const threshold = 30 - (settings.sceneDetectSensitivity / 100 * 28);

            if (avgDiff > threshold) {
                if (isSlideModeEnabled) {
                    // SLIDE MODE: Wait for stabilization
                    if (!isSlideCooldownRef.current && !isSlideStabilizingRef.current) {
                        isSlideStabilizingRef.current = true;

                        // Wait 750ms for text to sharpen/transition into place
                        slideStabilizationTimerRef.current = window.setTimeout(() => {
                            handleCaptureFrame();
                            isSlideStabilizingRef.current = false;

                            // cooldown to prevent duplicates
                            isSlideCooldownRef.current = true;
                            slideCooldownTimerRef.current = window.setTimeout(() => {
                                isSlideCooldownRef.current = false;
                            }, 2000);

                        }, 750);
                    }
                } else {
                    // STANDARD MODE: Instant Capture
                    handleCaptureFrame();
                }
            }
        }
        lastSceneFrameDataRef.current = currentFrameData;
        animationFrameRef.current = requestAnimationFrame(analyzePixelChange);
    }, [handleCaptureFrame, settings.sceneDetectSensitivity, stopAllCapturing, isSlideModeEnabled]);

    // Cleanup slide timers on unmount or mode change
    useEffect(() => {
        return () => {
            if (slideStabilizationTimerRef.current) window.clearTimeout(slideStabilizationTimerRef.current);
            if (slideCooldownTimerRef.current) window.clearTimeout(slideCooldownTimerRef.current);
        };
    }, []);

    const runFastScanStep = useCallback(async () => {
        const video = videoRef.current;
        const canvas = sceneDetectCanvasRef.current;

        // Fast Scan requires seeking, so it fails on screen capture. 
        if (isScreenCapturing) return;

        if (!isAutoCapturingRef.current || !video || !canvas || video.currentTime >= video.duration) {
            stopAllCapturing();
            return;
        }
        const scanIncrement = 0.5;
        video.currentTime += scanIncrement;
        await new Promise<void>(resolve => {
            const onSeeked = () => {
                video.removeEventListener('seeked', onSeeked);
                resolve();
            };
            video.addEventListener('seeked', onSeeked);
        });
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) { stopAllCapturing(); return; }
        const scale = 0.1;
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const currentFrameData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        if (lastSceneFrameDataRef.current) {
            let diff = 0;
            for (let i = 0; i < currentFrameData.length; i += 4) {
                diff += Math.abs(currentFrameData[i] - lastSceneFrameDataRef.current[i]);
                diff += Math.abs(currentFrameData[i + 1] - lastSceneFrameDataRef.current[i + 1]);
                diff += Math.abs(currentFrameData[i + 2] - lastSceneFrameDataRef.current[i + 2]);
            }
            const avgDiff = diff / (currentFrameData.length * 0.75);
            const threshold = 30 - (settings.sceneDetectSensitivity / 100 * 28);
            if (avgDiff > threshold) {
                handleCaptureFrame();
                lastSceneFrameDataRef.current = currentFrameData;
            }
        }
        animationFrameRef.current = requestAnimationFrame(runFastScanStep);
    }, [settings.sceneDetectSensitivity, handleCaptureFrame, stopAllCapturing]);




    const captureFrameAsBase64 = useCallback(() => {
        const sourceVideo = isScreenCapturing ? screenVideoRef.current : videoRef.current;
        const canvas = canvasRef.current;
        if (sourceVideo && canvas) {
            canvas.width = sourceVideo.videoWidth;
            canvas.height = sourceVideo.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.2);
                return dataUrl.split(',')[1];
            }
        }
        return null;
    }, []);

    const runAiAnalysis = useCallback(async () => {
        const sourceVideo = isScreenCapturing ? screenVideoRef.current : videoRef.current;
        if (!sourceVideo || (!isScreenCapturing && (sourceVideo.paused || sourceVideo.ended))) {
            stopAllCapturing();
            return;
        }
        setAiStatus('Capturing frame for analysis...');
        const currentFrameBase64 = captureFrameAsBase64();
        if (!currentFrameBase64) {
            setAiStatus('Failed to capture frame.');
            return;
        }
        if (!lastAiAnalyzedFrameRef.current) {
            setAiStatus('Setting baseline frame...');
            handleCaptureFrame();
            lastAiAnalyzedFrameRef.current = currentFrameBase64;
            setAiStatus('Baseline set. Monitoring for changes...');
            return;
        }
        try {
            setAiStatus('Asking AI to compare frames...');
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const lastFramePart = { inlineData: { mimeType: 'image/jpeg', data: lastAiAnalyzedFrameRef.current } };
            const currentFramePart = { inlineData: { mimeType: 'image/jpeg', data: currentFrameBase64 } };
            const textPart = { text: `Expert film editor check: significant scene change? YES/NO only.` };
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: [lastFramePart, currentFramePart, textPart] },
            });
            if (response.text?.toUpperCase().includes('YES')) {
                setAiStatus('Scene change detected!');
                handleCaptureFrame();
                lastAiAnalyzedFrameRef.current = currentFrameBase64;
            } else {
                setAiStatus('No change. Monitoring...');
            }
        } catch (error) {
            console.error("AI scene detection failed:", error);
            setAiStatus('AI analysis failed.');
            stopAllCapturing();
        }
    }, [captureFrameAsBase64, handleCaptureFrame, stopAllCapturing]);

    const handleToggleAutoCapture = useCallback(() => {
        if (isAutoCapturing) {
            stopAllCapturing();
            return;
        }
        const video = videoRef.current;
        if (!video || autoCaptureMode === 'off') return;
        captureStartTimeRef.current = Date.now();
        if (autoCaptureMode !== 'pixelDetect' || !isFastScanEnabled) {
            video.play().catch(() => { });
        }
        setIsAutoCapturing(true);
        const captureFrameInterval = 1000 / settings.fps;
        switch (autoCaptureMode) {
            case 'interval':
                autoCaptureIntervalRef.current = window.setInterval(handleCaptureFrame, captureFrameInterval);
                break;
            case 'timeRange':
                if (video.currentTime < timeRange.start) video.currentTime = timeRange.start;
                autoCaptureIntervalRef.current = window.setInterval(() => {
                    if (videoRef.current) {
                        const ct = videoRef.current.currentTime;
                        if (ct >= timeRange.start && ct <= timeRange.end) handleCaptureFrame();
                        if (ct > timeRange.end || videoRef.current.ended) stopAllCapturing();
                    }
                }, captureFrameInterval);
                break;
            case 'pixelDetect':
                lastSceneFrameDataRef.current = null;
                if (isFastScanEnabled) {
                    video.pause();
                    animationFrameRef.current = requestAnimationFrame(runFastScanStep);
                } else {
                    animationFrameRef.current = requestAnimationFrame(analyzePixelChange);
                }
                break;
            case 'aiDetect':
                lastAiAnalyzedFrameRef.current = null;
                runAiAnalysis();
                autoCaptureIntervalRef.current = window.setInterval(runAiAnalysis, Math.max(captureFrameInterval, 500));
                break;
        }
    }, [isAutoCapturing, autoCaptureMode, settings.fps, handleCaptureFrame, timeRange, analyzePixelChange, runAiAnalysis, stopAllCapturing, isFastScanEnabled, runFastScanStep]);

    const handleSetTimeRange = (point: 'start' | 'end') => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const currentTime = video.currentTime;
            canvas.width = 320;
            canvas.height = (video.videoHeight / video.videoWidth) * 320;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                setRangeThumbnails(prev => ({ ...prev, [point]: canvas.toDataURL('image/jpeg', 0.6) }));
            }
            setTimeRange(prev => ({ ...prev, [point]: currentTime }));
        }
    };

    const handleSeek = useCallback((time: number) => {
        if (videoRef.current) {
            const epsilon = 0.001;
            const safeTime = Math.max(0, Math.min(time + epsilon, videoRef.current.duration));
            videoRef.current.currentTime = safeTime;
            setVideoCurrentTime(time);
        }
    }, []);

    const handleStepFrame = useCallback((direction: 'forward' | 'backward') => {
        if (videoRef.current) {
            const video = videoRef.current;
            const frameTime = 0.04;
            const targetTime = direction === 'forward'
                ? Math.min(video.duration, video.currentTime + frameTime)
                : Math.max(0, video.currentTime - frameTime);
            handleSeek(targetTime);
        }
    }, [handleSeek]);

    const handleClearAllFrames = (options?: { skipConfirm?: boolean }) => {
        if (options?.skipConfirm || window.confirm('Clear all captured frames?')) {
            setCapturedFrames([]);
            setCaptureDuration(null);
        }
    };

    const handleDeleteFrame = (id: string) => {
        setCapturedFrames(prevFrames => prevFrames.filter(frame => frame.id !== id));
    };

    const handleDeleteFrames = (ids: string[]) => {
        setCapturedFrames(prevFrames => prevFrames.filter(frame => !ids.includes(frame.id)));
    };

    const handleUpdateFrame = (id: string, newFilters: FilterConfig) => {
        setCapturedFrames(prevFrames =>
            prevFrames.map(f => f.id === id ? { ...f, filters: newFilters } : f)
        );
    };

    const handleUpdateAllFrames = (newFilters: FilterConfig) => {
        setCapturedFrames(prevFrames => prevFrames.map(f => ({ ...f, filters: newFilters })));
    };

    const handleZoom = (direction: 'in' | 'out') => {
        if (!videoRef.current || videoDuration === 0) return;
        const maxZoom = 30;
        const zoomFactor = 1.5;
        const newZoomLevel = direction === 'in'
            ? Math.min(maxZoom, zoomLevel * zoomFactor)
            : Math.max(1, zoomLevel / zoomFactor);
        setZoomLevel(newZoomLevel);
        if (newZoomLevel <= 1.01) {
            setTimelineRange({ start: 0, end: videoDuration });
            setZoomLevel(1);
            return;
        }
        const newRangeDuration = videoDuration / newZoomLevel;
        let newStart = videoCurrentTime - newRangeDuration / 2;
        let newEnd = videoCurrentTime + newRangeDuration / 2;
        if (newStart < 0) { newStart = 0; newEnd = newRangeDuration; }
        if (newEnd > videoDuration) { newEnd = videoDuration; newStart = videoDuration - newRangeDuration; }
        setTimelineRange({ start: newStart, end: newEnd });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const ae = document.activeElement;
            if (ae instanceof HTMLInputElement || ae instanceof HTMLTextAreaElement) return;
            if (!videoRef.current || !isVideoReady) return;
            switch (e.key) {
                case ' ': case 'k': e.preventDefault();
                    if (videoRef.current.paused) videoRef.current.play().catch(() => { });
                    else videoRef.current.pause();
                    break;
                case 'ArrowLeft': e.preventDefault(); handleSeek(videoRef.current.currentTime - 5); break;
                case 'ArrowRight': e.preventDefault(); handleSeek(videoRef.current.currentTime + 5); break;
                case ',': e.preventDefault(); handleStepFrame('backward'); break;
                case '.': e.preventDefault(); handleStepFrame('forward'); break;
                case 'c': case 'C': case 'Enter': e.preventDefault(); handleCaptureFrame(); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVideoReady, handleCaptureFrame, handleSeek, handleStepFrame]);

    return (
        <div className="theme-bg theme-text min-h-screen font-sans relative overflow-x-hidden selection:bg-indigo-500/30">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
            </div>

            <main className="relative z-10 max-w-[1600px] mx-auto flex flex-col gap-4 sm:gap-6 px-3 sm:px-4 py-4 sm:py-6 md:px-8">
                {/* Header Section */}
                <header className="flex items-center justify-between py-3 sm:py-4 theme-border theme-surface-glass rounded-xl sm:rounded-2xl px-4 sm:px-6 sticky top-2 z-50">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <LogoIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-xl font-bold theme-text tracking-tight leading-none">
                                Catch My<span className="text-indigo-400">Frame</span>
                            </h1>
                            <p className="text-[8px] sm:text-[10px] theme-text-muted font-mono tracking-wider mt-0.5 sm:mt-1 uppercase hidden sm:block">Professional Capture Studio</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {!isOnline && (
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--error-bg)] border border-[var(--error)] rounded-lg text-xs font-bold text-[var(--error)]">
                                <WifiOff className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline">OFFLINE MODE</span>
                            </div>
                        )}
                        <ThemeToggle />
                        <button onClick={() => setShowOnboarding(true)} title="Help & Overview" aria-label="Help" className="group p-2 sm:p-2.5 rounded-lg sm:rounded-xl theme-bg-card hover:theme-bg-elevated theme-border transition-all theme-text-secondary hover:theme-text">
                            <CircleHelp className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </button>
                        <button onClick={() => setIsShortcutsModalOpen(true)} title="Keyboard Shortcuts" aria-label="Keyboard Shortcuts" className="group p-2 sm:p-2.5 rounded-lg sm:rounded-xl theme-bg-card hover:theme-bg-elevated theme-border transition-all theme-text-secondary hover:theme-text hidden sm:flex">
                            <Keyboard className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </button>
                        <button onClick={() => setIsSettingsModalOpen(true)} title="Settings" aria-label="Settings" className="group p-2 sm:p-2.5 rounded-lg sm:rounded-xl theme-bg-card hover:theme-bg-elevated theme-border transition-all theme-text-secondary hover:theme-text">
                            <Settings2 className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                        </button>
                    </div>
                </header>

                <div className="w-full transition-all duration-500 ease-out">
                    {showInputControls && (
                        <div className="animate-fade-in max-w-4xl mx-auto py-6 sm:py-12">
                            <InputControls
                                onVideoLoad={handleVideoLoad} onUrlLoad={handleUrlLoad}
                                isLoading={isLoading} loadingProgress={loadingProgress}
                                videoSourceType={videoSourceType} isOnline={isOnline}
                            />
                            {videoSrc && (
                                <div className="text-center mt-6">
                                    <button onClick={() => setShowInputControls(false)} className="text-sm font-medium theme-text-secondary hover:theme-text underline decoration-current/30 underline-offset-4">
                                        Return to Editor
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Workspace */}
                <div className={`grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-6 transition-opacity duration-500 ${showInputControls ? 'hidden opacity-0' : 'opacity-100'}`}>

                    {/* Hidden Screen Capture Video Element */}
                    <video ref={screenVideoRef} className="hidden" playsInline muted autoPlay />

                    {/* Left Column: Player & Main Actions */}
                    <div className="flex flex-col gap-4">
                        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 ring-1 ring-black/50 group">
                            <VideoPlayer
                                videoSrc={videoSrc}
                                videoRef={videoRef}
                                isVideoReady={isVideoReady}
                                videoSourceType={videoSourceType}
                                videoDuration={videoDuration}
                                videoCurrentTime={videoCurrentTime}
                                onSeek={handleSeek}
                                onStepFrame={handleStepFrame}
                                playbackRate={playbackRate}
                                onPlaybackRateChange={setPlaybackRate}
                                autoCaptureMode={autoCaptureMode}
                                timeRange={timelineRange}
                                onZoom={handleZoom}
                                zoomLevel={zoomLevel}
                                capturedFrameTimestamps={capturedFrames.map(f => f.timestamp)}
                                timelineRange={timelineRange}
                                onEnableScreenCapture={supportsScreenCapture ? startScreenCapture : undefined}
                                isScreenCapturing={isScreenCapturing}
                                supportsScreenCapture={supportsScreenCapture}
                            />
                        </div>

                        {/* Primary Control Deck - Mobile Optimized */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch theme-bg-card backdrop-blur-xl theme-border p-2 sm:p-3 rounded-xl sm:rounded-2xl">
                            {/* Source Button */}
                            <button onClick={() => setShowInputControls(true)} className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 btn-secondary text-sm font-bold rounded-xl transition-all min-w-[80px]">
                                <Upload className="w-5 h-5 sm:w-4 sm:h-4" />
                                <span className="sm:hidden md:inline">Source</span>
                            </button>

                            {/* Capture Button - Full Width on Mobile */}
                            <button onClick={handleCaptureFrame} disabled={!isVideoReady || isAutoCapturing} className="flex-1 flex items-center justify-center gap-3 px-6 py-4 sm:py-3 btn-primary disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl transition-all transform active:scale-95">
                                <Aperture className="w-6 h-6" />
                                <span className="text-base tracking-wide uppercase">Capture</span>
                            </button>

                            {/* Auto-Capture Button */}
                            <button
                                onClick={() => setShowAutoCapturePanel(!showAutoCapturePanel)}
                                className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2 rounded-xl border transition-all text-sm font-bold min-w-[80px] ${showAutoCapturePanel ? 'bg-[var(--brand-primary-light)] text-[var(--brand-primary)] border-[var(--brand-primary)]' : 'theme-bg-secondary theme-text-secondary theme-border hover:theme-text'}`}
                            >
                                <Timer className="w-5 h-5 sm:w-4 sm:h-4" />
                                <span className="sm:hidden md:inline">Auto</span>
                                {showAutoCapturePanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        </div>

                        <div ref={galleryRef} className="mt-2 sm:mt-4">
                            <FrameGallery
                                frames={capturedFrames} onClearAll={handleClearAllFrames}
                                onDeleteFrame={handleDeleteFrame} onDeleteFrames={handleDeleteFrames}
                                onUpdateFrame={handleUpdateFrame}
                                onUpdateAllFrames={handleUpdateAllFrames}
                                captureDuration={captureDuration} isOnline={isOnline}
                                initialExportFormat={settings.exportFormat}
                                onExportFormatChange={(fmt) => setSettings(prev => ({ ...prev, exportFormat: fmt }))}
                            />
                        </div>
                    </div>

                    {/* Right Column: Tools & Info */}
                    <div className="flex flex-col gap-6">
                        {showAutoCapturePanel && (
                            <div className="animate-fade-in sticky top-24">
                                <AutoCapturePanel
                                    isAutoCapturing={isAutoCapturing} onToggleAutoCapture={handleToggleAutoCapture}
                                    autoCaptureMode={autoCaptureMode} onAutoCaptureModeChange={setAutoCaptureMode}
                                    isVideoReady={isVideoReady} timeRange={timeRange}
                                    onSetTimeRange={handleSetTimeRange} rangeThumbnails={rangeThumbnails}
                                    onSeekToTime={handleSeek} sceneDetectSensitivity={settings.sceneDetectSensitivity}
                                    onSceneDetectSensitivityChange={(val) => setSettings(prev => ({ ...prev, sceneDetectSensitivity: val }))}
                                    isFastScanEnabled={isFastScanEnabled} onIsFastScanEnabledChange={setIsFastScanEnabled}
                                    isSlideModeEnabled={isSlideModeEnabled} onIsSlideModeEnabledChange={setIsSlideModeEnabled}
                                    aiStatus={aiStatus} aiSceneDetectSensitivity={settings.aiSceneDetectSensitivity}
                                    onAiSceneDetectSensitivityChange={(val) => setSettings(prev => ({ ...prev, aiSceneDetectSensitivity: val }))}

                                    settingsFps={settings.fps}
                                    videoCurrentTime={videoCurrentTime}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <OnboardingOverlay isOpen={showOnboarding} onClose={handleCloseOnboarding} />
                <ShortcutsModal isOpen={isShortcutsModalOpen} onClose={() => setIsShortcutsModalOpen(false)} />
                <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} settings={settings} onSettingsChange={setSettings} />
                <canvas ref={canvasRef} className="hidden"></canvas>
                <canvas ref={sceneDetectCanvasRef} className="hidden"></canvas>
            </main>
        </div>
    );
};

export default ToolPage;
