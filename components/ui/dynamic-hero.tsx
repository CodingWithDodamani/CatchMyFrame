
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { CameraIcon, WandIcon, VideoIcon, LogoIcon } from '../icons';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

// Helper to parse 'rgb(r, g, b)' or 'rgba(r, g, b, a)' string to {r, g, b}
const parseRgbColor = (colorString: string | null) => {
    if (!colorString) return null;
    const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match) {
        return {
            r: parseInt(match[1], 10),
            g: parseInt(match[2], 10),
            b: parseInt(match[3], 10),
        };
    }
    return null;
};

// A simple SVG Play Icon
const PlayIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5V19L19 12L8 5Z" />
    </svg>
);

// Menu Icon for Mobile
const MenuIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

// Close Icon for Mobile Menu
const CloseIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface NavItem {
    id: string;
    label: string;
    onClick?: () => void;
    href?: string;
    target?: string;
}

const defaultNavItems: NavItem[] = [
    { id: 'home', label: 'Home', href: '#' },
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'about', label: 'About', href: '#about' },
    { id: 'contact', label: 'Contact', href: '#contact' },
    { id: 'get-started-nav', label: 'Get Started', onClick: () => console.info('Default Nav Get Started clicked') },
];

interface HeroSectionProps {
    heading?: string;
    tagline?: string;
    buttonText?: string;
    imageUrl?: string;
    videoUrl?: string;
    navItems?: NavItem[];
    onButtonClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
    heading = "Something you really want",
    tagline = "You can't live without this product. I'm sure of it.",
    buttonText = "Get Started",
    imageUrl,
    videoUrl,
    onButtonClick,
    navItems = defaultNavItems,
}) => {
    const { isDark } = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const targetRef = useRef<HTMLAnchorElement>(null);
    const mousePosRef = useRef({ x: null as number | null, y: null as number | null });
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const animationFrameIdRef = useRef<number | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showVideo, setShowVideo] = useState(!!videoUrl);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const resolvedCanvasColorsRef = useRef({
        strokeStyle: { r: 99, g: 102, b: 241 }, // Indigo-500 default
    });

    // Handle scroll for header background
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const tempElement = document.createElement('div');
        tempElement.style.display = 'none';
        tempElement.classList.add('text-indigo-500'); // Use brand color
        document.body.appendChild(tempElement);

        const updateResolvedColors = () => {
            const computedFgColor = getComputedStyle(tempElement).color;
            const parsedFgColor = parseRgbColor(computedFgColor);
            if (parsedFgColor) {
                resolvedCanvasColorsRef.current.strokeStyle = parsedFgColor;
            }
        };
        updateResolvedColors();
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class' && mutation.target === document.documentElement) {
                    updateResolvedColors();
                    break;
                }
            }
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => {
            observer.disconnect();
            if (tempElement.parentNode) {
                tempElement.parentNode.removeChild(tempElement);
            }
        };
    }, []);

    const drawArrow = useCallback(() => {
        if (!canvasRef.current || !targetRef.current || !ctxRef.current) return;

        const targetEl = targetRef.current;
        const ctx = ctxRef.current;
        const mouse = mousePosRef.current;

        const x0 = mouse.x;
        const y0 = mouse.y;

        if (x0 === null || y0 === null) return;

        const rect = targetEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const a = Math.atan2(cy - y0, cx - x0);
        const x1 = cx - Math.cos(a) * (rect.width / 2 + 12);
        const y1 = cy - Math.sin(a) * (rect.height / 2 + 12);

        const midX = (x0 + x1) / 2;
        const midY = (y0 + y1) / 2;
        const offset = Math.min(200, Math.hypot(x1 - x0, y1 - y0) * 0.5);
        const t = Math.max(-1, Math.min(1, (y0 - y1) / 200));
        const controlX = midX;
        const controlY = midY + offset * t;

        const r = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
        const opacity = Math.min(1.0, (r - Math.max(rect.width, rect.height) / 2) / 500);

        const arrowColor = resolvedCanvasColorsRef.current.strokeStyle;
        ctx.strokeStyle = `rgba(${arrowColor.r}, ${arrowColor.g}, ${arrowColor.b}, ${opacity})`;
        ctx.lineWidth = 2;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(controlX, controlY, x1, y1);
        ctx.setLineDash([10, 5]);
        ctx.stroke();
        ctx.restore();

        const angle = Math.atan2(y1 - controlY, x1 - controlX);
        const headLength = 10 * (ctx.lineWidth / 1.5);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(
            x1 - headLength * Math.cos(angle - Math.PI / 6),
            y1 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(x1, y1);
        ctx.lineTo(
            x1 - headLength * Math.cos(angle + Math.PI / 6),
            y1 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !targetRef.current) return;

        ctxRef.current = canvas.getContext("2d");
        const ctx = ctxRef.current;

        const updateCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mousePosRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener("resize", updateCanvasSize);
        window.addEventListener("mousemove", handleMouseMove);
        updateCanvasSize();

        const animateLoop = () => {
            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawArrow();
            }
            animationFrameIdRef.current = requestAnimationFrame(animateLoop);
        };

        animateLoop();

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            window.removeEventListener("mousemove", handleMouseMove);
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [drawArrow]);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement && videoUrl) {
            const handleVideoEnd = () => {
                if (!videoElement.loop) {
                    setShowVideo(false);
                    videoElement.currentTime = 0;
                }
            };

            if (showVideo) {
                if (videoElement.paused) {
                    const playPromise = videoElement.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            if (error.name !== 'AbortError') {
                                setShowVideo(false);
                            }
                        });
                    }
                }
                videoElement.addEventListener('ended', handleVideoEnd);
            } else {
                videoElement.pause();
            }

            return () => {
                if (videoElement) {
                    videoElement.removeEventListener('ended', handleVideoEnd);
                }
            };
        }
    }, [showVideo, videoUrl]);

    // Separate regular nav items from CTA button
    const regularNavItems = navItems.filter(item => item.id !== 'launch-tool' && !item.onClick);
    const ctaNavItem = navItems.find(item => item.id === 'launch-tool' || item.onClick);

    return (
        <div className="relative min-h-screen flex flex-col pt-6 pb-20 z-10">
            {/* Header / Nav - Fixed with Glassmorphism */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? (isDark ? 'bg-gray-900/80' : 'bg-white/80') + ' backdrop-blur-xl border-b theme-border-secondary shadow-2xl' : ''}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-8 py-4">
                    {/* Logo */}
                    <a href="#" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                            <LogoIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:inline theme-text">
                            Catch My <span className="text-indigo-400">Frame</span>
                        </span>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {regularNavItems.map((item) => (
                            <a
                                key={item.id}
                                href={item.href || '#'}
                                className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-black/5'}`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    {/* CTA Button & Theme Toggle */}
                    <div className="hidden md:flex items-center gap-3">
                        <ThemeToggle />
                        {ctaNavItem && (
                            <button
                                onClick={ctaNavItem.onClick}
                                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105"
                            >
                                {ctaNavItem.label}
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        aria-label="Toggle Menu"
                    >
                        {isMobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-gray-900/95 backdrop-blur-xl border-t border-white/5 px-6 py-4 space-y-2">
                        {navItems.map((item) => (
                            item.onClick ? (
                                <button
                                    key={item.id}
                                    onClick={() => { item.onClick?.(); setIsMobileMenuOpen(false); }}
                                    className="w-full px-4 py-3 text-left font-medium text-white bg-indigo-600 rounded-xl text-sm"
                                >
                                    {item.label}
                                </button>
                            ) : (
                                <a
                                    key={item.id}
                                    href={item.href || '#'}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    {item.label}
                                </a>
                            )
                        ))}
                        {/* Theme Toggle in Mobile Menu */}
                        <div className="pt-2 border-t border-white/5 mt-2">
                            <div className="flex items-center justify-between px-4 py-2">
                                <span className="text-sm text-gray-400">Theme</span>
                                <ThemeToggle showLabel />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow flex flex-col items-center justify-center px-4 relative mt-16">
                {/* Hero Content */}
                <div className="relative z-20 flex flex-col items-center text-center max-w-4xl mx-auto">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-medium mb-8 backdrop-blur-sm animate-fade-in ${isDark ? 'bg-white/5 border-white/10 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        🎉 v1.0.1 Now with AI Scene Detection
                    </div>

                    <h1 className={`text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text mb-6 drop-shadow-sm leading-[1.1] ${isDark ? 'bg-gradient-to-b from-white via-white to-gray-400' : 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-600'}`}>
                        {heading}
                    </h1>

                    <p className={`text-base sm:text-lg lg:text-xl max-w-2xl mb-8 sm:mb-12 leading-relaxed px-4 sm:px-0 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {tagline}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
                            <a
                                ref={targetRef}
                                href="#"
                                onClick={(e) => { e.preventDefault(); onButtonClick?.(); }}
                                className={`relative flex items-center justify-center px-8 py-4 text-lg font-bold rounded-xl border transition-all duration-200 shadow-2xl ${isDark ? 'text-white bg-gray-900 border-white/10 hover:bg-gray-800' : 'text-white bg-gray-900 border-gray-200 hover:bg-gray-800'}`}
                            >
                                🚀 {buttonText}
                                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </a>
                        </div>
                        <a
                            href="#features"
                            className={`flex items-center justify-center px-8 py-4 text-lg font-medium rounded-xl border transition-all duration-200 ${isDark ? 'text-gray-300 bg-white/5 hover:bg-white/10 border-white/10' : 'text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-200'}`}
                        >
                            Learn More
                        </a>
                    </div>
                </div>

                {/* App Mockup Preview */}
                <div className="relative mt-12 sm:mt-24 w-full max-w-5xl mx-auto perspective-1000 px-2 sm:px-0">
                    {/* Background Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

                    {/* Floating Badges - Hidden on small mobile */}
                    <div className="absolute -left-4 sm:-left-16 top-1/4 z-30 animate-bounce delay-700 duration-[3000ms] hidden sm:block">
                        <div className={`backdrop-blur-xl rounded-xl p-4 shadow-2xl flex items-center gap-3 ${isDark ? 'bg-gray-900/90 border border-white/10' : 'bg-white/90 border border-gray-200'}`}>
                            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 rounded-lg border border-indigo-500/20"><WandIcon className="w-5 h-5 text-indigo-400" /></div>
                            <div>
                                <div className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Smart Edit</div>
                                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pixel Perfect</div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-4 sm:-right-16 bottom-1/3 z-30 animate-bounce delay-100 duration-[4000ms] hidden sm:block">
                        <div className={`backdrop-blur-xl rounded-xl p-4 shadow-2xl flex items-center gap-3 ${isDark ? 'bg-gray-900/90 border border-white/10' : 'bg-white/90 border border-gray-200'}`}>
                            <div className="p-2.5 bg-gradient-to-br from-pink-500/20 to-rose-500/10 rounded-lg border border-pink-500/20"><CameraIcon className="w-5 h-5 text-pink-400" /></div>
                            <div>
                                <div className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Auto-Capture</div>
                                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Analysis</div>
                            </div>
                        </div>
                    </div>

                    {/* The "Window" */}
                    <div className="relative bg-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/10 transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out">
                        {/* Window Header */}
                        <div className="h-12 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-md border-b border-white/5 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                            <div className="ml-4 flex-1 max-w-xs h-6 bg-white/5 rounded-lg flex items-center px-3 gap-2">
                                <div className="w-3 h-3 rounded-full bg-white/10"></div>
                                <div className="text-[10px] text-gray-500 font-mono">catchmyframe.app</div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="relative aspect-video bg-black flex items-center justify-center group">
                            {imageUrl && (
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showVideo ? 'opacity-0' : 'opacity-100'}`}
                                />
                            )}
                            {videoUrl && (
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    muted playsInline loop autoPlay
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showVideo ? 'opacity-100' : 'opacity-0'}`}
                                />
                            )}

                            {/* Overlay UI Mockup elements */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-14 bg-black/70 backdrop-blur-xl rounded-xl border border-white/10 flex items-center px-4 gap-4 shadow-2xl opacity-80 group-hover:opacity-100 transition-opacity">
                                <div className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center">
                                    <PlayIcon className="w-3 h-3 text-white" />
                                </div>
                                <div className="flex-grow h-1.5 bg-white/20 rounded-full overflow-hidden">
                                    <div className="w-1/3 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                                </div>
                                <div className="text-[10px] font-mono text-gray-400">01:23 / 04:56</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll Indicator - Hidden on small mobile */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 animate-bounce hidden sm:flex">
                    <span className={`text-xs uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Scroll</span>
                    <div className={`w-6 h-10 border-2 rounded-full flex justify-center pt-2 ${isDark ? 'border-white/20' : 'border-gray-300'}`}>
                        <div className={`w-1.5 h-3 rounded-full animate-pulse ${isDark ? 'bg-white/40' : 'bg-gray-400'}`}></div>
                    </div>
                </div>
            </main>

            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40"></canvas>

            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .rotate-x-12 { transform: rotateX(12deg); }
                .hover\\:rotate-x-0:hover { transform: rotateX(0deg); }
            `}</style>
        </div>
    );
};

export { HeroSection };
