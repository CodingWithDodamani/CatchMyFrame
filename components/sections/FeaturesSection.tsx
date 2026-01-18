
import React from 'react';
import {
    Gem,
    Brain,
    Zap,
    Layers,
    WifiOff,
    Target,
    ArrowRight
} from 'lucide-react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    link?: string;
    gradient: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, link, gradient }) => (
    <div className="group relative p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-indigo-500/40 transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(99,102,241,0.4)] hover:-translate-y-2 overflow-hidden">
        {/* Animated gradient background on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${gradient} blur-xl`}></div>

        {/* Floating corner decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full opacity-50"></div>

        {/* Icon with modern styling */}
        <div className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 sm:mb-6 text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {icon}
        </div>

        <h3 className="relative text-lg sm:text-xl font-bold theme-text mb-2 sm:mb-3 group-hover:text-indigo-300 transition-colors">{title}</h3>
        <p className="relative text-xs sm:text-sm theme-text-muted leading-relaxed mb-4 sm:mb-5">{description}</p>

        {link && (
            <a href={link} className="relative inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wide group/link">
                <span className="relative">
                    Learn More
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-400 group-hover/link:w-full transition-all duration-300"></span>
                </span>
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </a>
        )}
    </div>
);

export const FeaturesSection: React.FC = () => (
    <div id="features" className="container mx-auto px-4 py-16 sm:py-24 lg:py-32 relative z-20">
        {/* Section Background Glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="text-center mb-20 relative">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-bold uppercase tracking-widest mb-6 border border-indigo-500/20 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold theme-text mb-4 sm:mb-6 leading-tight">
                Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Catch My Frame</span>?
            </h2>
            <p className="theme-text-muted max-w-2xl mx-auto text-base sm:text-lg leading-relaxed px-4 sm:px-0">
                Built for editors, content creators, and developers who need more than just a screenshot.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto relative">
            <FeatureCard
                icon={<Gem className="w-8 h-8" strokeWidth={1.5} />}
                title="Lossless Capture"
                description="Extract frames in pristine PNG format or high-quality JPEG. We preserve the original source resolution up to 4K and beyond."
                gradient="from-cyan-500 to-blue-600"
                link="#"
            />
            <FeatureCard
                icon={<Brain className="w-8 h-8" strokeWidth={1.5} />}
                title="AI Scene Detection"
                description="Powered by Gemini AI, automatically detect meaningful scene changes and cuts, saving you hours of manual scrubbing."
                gradient="from-violet-500 to-purple-600"
                link="#"
            />
            <FeatureCard
                icon={<Zap className="w-8 h-8" strokeWidth={1.5} />}
                title="Smart Automation"
                description="Set interval triggers, pixel-difference detection, or time ranges. Let the tool do the heavy lifting while you work."
                gradient="from-amber-500 to-orange-600"
                link="#"
            />
            <FeatureCard
                icon={<Layers className="w-8 h-8" strokeWidth={1.5} />}
                title="Studio Editor"
                description="Adjust brightness, contrast, and apply sharpening filters directly within the browser before exporting."
                gradient="from-pink-500 to-rose-600"
                link="#"
            />
            <FeatureCard
                icon={<WifiOff className="w-8 h-8" strokeWidth={1.5} />}
                title="Offline Capable"
                description="Your privacy matters. Process local video files entirely on your device without uploading data to the cloud."
                gradient="from-emerald-500 to-teal-600"
                link="#"
            />
            <FeatureCard
                icon={<Target className="w-8 h-8" strokeWidth={1.5} />}
                title="Frame Precision"
                description="Navigate frame-by-frame with millisecond accuracy. Never miss the perfect micro-moment again."
                gradient="from-indigo-500 to-blue-600"
                link="#"
            />
        </div>
    </div>
);
