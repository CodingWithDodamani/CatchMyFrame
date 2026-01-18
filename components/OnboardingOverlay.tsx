
import React, { useState, useEffect } from 'react';
import { CameraIcon, VideoIcon, LayersIcon, KeyboardIcon, CheckCircleIcon, ChevronDownIcon } from './icons';

interface OnboardingOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(0);

    // Reset step when opened
    useEffect(() => {
        if (isOpen) setStep(0);
    }, [isOpen]);

    if (!isOpen) return null;

    const steps = [
        {
            title: "Welcome to Frame Grabber Pro",
            description: "The ultimate tool for capturing high-quality frames from any video source. Let's get you set up in seconds.",
            icon: <VideoIcon className="w-16 h-16 text-indigo-500" />,
            color: "from-indigo-600 to-blue-600"
        },
        {
            title: "Universal Capture",
            description: "Paste a YouTube URL or upload a video file directly. Our smart proxy handles YouTube streams automatically.",
            icon: <div className="relative">
                <VideoIcon className="w-16 h-16 text-red-500" />
                <div className="absolute -bottom-2 -right-2 bg-black px-2 py-0.5 rounded text-[10px] font-bold border border-white/20">PROXY</div>
            </div>,
            color: "from-red-600 to-orange-600"
        },
        {
            title: "Master the Controls",
            description: (
                <div className="space-y-2 mt-2 text-sm">
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                        <kbd className="bg-black/50 px-2 py-1 rounded text-xs font-mono border border-white/10">Space</kbd>
                        <span>Play / Pause</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                        <kbd className="bg-black/50 px-2 py-1 rounded text-xs font-mono border border-white/10">S</kbd>
                        <span>Capture Frame</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                        <kbd className="bg-black/50 px-2 py-1 rounded text-xs font-mono border border-white/10">← / →</kbd>
                        <span>Seek 5s</span>
                    </div>
                </div>
            ),
            icon: <KeyboardIcon className="w-16 h-16 text-emerald-500" />,
            color: "from-emerald-600 to-teal-600"
        },
        {
            title: "Studio Gallery",
            description: "View your captured frames below. Select multiple frames to bulk export as a ZIP or clean up your session.",
            icon: <LayersIcon className="w-16 h-16 text-purple-500" />,
            color: "from-purple-600 to-pink-600"
        }
    ];

    const currentStep = steps[step];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative">

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
                    <div
                        className={`h-full bg-gradient-to-r ${currentStep.color} transition-all duration-500`}
                        style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                    />
                </div>

                <div className="p-8 text-center space-y-6">
                    {/* Icon Circle */}
                    <div className={`mx-auto w-32 h-32 rounded-full bg-gradient-to-br ${currentStep.color} p-[2px] shadow-2xl shadow-${currentStep.color.split('-')[1]}-500/20`}>
                        <div className="w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center relative overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-br ${currentStep.color} opacity-10 animate-pulse`}></div>
                            {currentStep.icon}
                        </div>
                    </div>

                    <div className="space-y-2 animate-slide-up">
                        <h2 className="text-2xl font-bold text-white tracking-tight">{currentStep.title}</h2>
                        <div className="text-gray-400 leading-relaxed text-sm min-h-[80px] flex flex-col justify-center">
                            {currentStep.description}
                        </div>
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                        <div className="flex gap-1.5 flex-1 justify-start">
                            {steps.map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? `w-6 bg-white` : 'w-1.5 bg-gray-700'}`} />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className={`px-8 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all hover:scale-105 active:scale-95 bg-gradient-to-r ${currentStep.color}`}
                        >
                            {step === steps.length - 1 ? "Get Started" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingOverlay;
