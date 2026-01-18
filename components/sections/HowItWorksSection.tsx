
import React from 'react';
import { Upload, Camera, Download } from 'lucide-react';

interface StepCardProps {
    number: number;
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
    glowColor: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, icon, title, description, gradient, glowColor }) => (
    <div className="relative flex flex-col items-center text-center group">
        {/* Floating number badge with glow */}
        <div className="absolute -top-3 -right-3 z-20">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg border-4 border-[#0F1116]`}>
                {number}
            </div>
        </div>

        {/* Main icon container */}
        <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:border-transparent transition-all duration-500 backdrop-blur-sm overflow-hidden`}>
            {/* Animated background gradient */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${gradient}`}></div>

            {/* Glow effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowColor} blur-xl`}></div>

            {/* Icon */}
            <div className="relative z-10 text-gray-400 group-hover:text-white transition-colors duration-300">
                {icon}
            </div>

            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-2xl"></div>
        </div>

        <h3 className="text-2xl font-bold theme-text mb-3 group-hover:text-indigo-300 transition-colors">{title}</h3>
        <p className="theme-text-muted leading-relaxed text-sm px-4 max-w-xs">{description}</p>
    </div>
);

export const HowItWorksSection: React.FC = () => (
    <div id="services" className="container mx-auto px-4 py-32 relative z-20 border-t border-white/5">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.03] to-transparent pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="text-center mb-24 relative">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm font-bold uppercase tracking-widest mb-6 border border-purple-500/20 backdrop-blur-sm">
                <span className="text-lg">🚀</span>
                How It Works
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold theme-text mb-6 leading-tight">
                From Video to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Still</span> in Seconds
            </h2>
            <p className="theme-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
                Our streamlined 3-step process makes extracting high-quality images effortless.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-1">
                <div className="h-full bg-gradient-to-r from-indigo-500/60 via-purple-500/60 to-pink-500/60 rounded-full"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/40 via-purple-500/40 to-pink-500/40 blur-md"></div>
            </div>

            <StepCard
                number={1}
                icon={<Upload className="w-14 h-14" strokeWidth={1.5} />}
                title="Upload Video"
                description="Drag & drop any video file or paste a YouTube URL. We support all major formats including MP4, WebM, and MOV."
                gradient="from-indigo-500 to-indigo-600"
                glowColor="bg-indigo-500/30"
            />

            <StepCard
                number={2}
                icon={<Camera className="w-14 h-14" strokeWidth={1.5} />}
                title="Capture & Edit"
                description="Use AI detection or manual controls to find the perfect frame. Adjust lighting, contrast, and apply filters."
                gradient="from-purple-500 to-purple-600"
                glowColor="bg-purple-500/30"
            />

            <StepCard
                number={3}
                icon={<Download className="w-14 h-14" strokeWidth={1.5} />}
                title="Export High-Res"
                description="Download your frames instantly in PNG or JPEG with custom DPI settings and naming conventions."
                gradient="from-pink-500 to-pink-600"
                glowColor="bg-pink-500/30"
            />
        </div>
    </div>
);
