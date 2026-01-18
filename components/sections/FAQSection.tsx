
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '../icons';

interface FAQItemProps {
    question: string;
    answer: string;
    index: number;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, index }) => {
    const [isOpen, setIsOpen] = useState(false);

    const gradients = [
        'from-indigo-500/20 to-purple-500/20',
        'from-purple-500/20 to-pink-500/20',
        'from-cyan-500/20 to-blue-500/20',
        'from-emerald-500/20 to-teal-500/20',
    ];

    return (
        <div className={`group border border-white/10 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent overflow-hidden hover:border-indigo-500/30 transition-all duration-300 ${isOpen ? 'shadow-lg shadow-indigo-500/5' : ''}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                        {String(index + 1).padStart(2, '0')}
                    </div>
                    <span className="font-bold theme-text text-lg">{question}</span>
                </div>
                <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-indigo-500/20 rotate-180' : ''}`}>
                    {isOpen ? <ChevronUpIcon className="w-5 h-5 text-indigo-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6 ml-14 theme-text-muted leading-relaxed border-t border-white/5 pt-4">
                    {answer}
                </div>
            </div>
        </div>
    );
};

const faqs = [
    { question: "Is Catch My Frame free to use?", answer: "Yes! The core features are completely free. We may introduce premium cloud features in the future, but local processing will always remain free and unlimited." },
    { question: "Are my videos uploaded to a server?", answer: "No. For privacy and speed, all video processing happens locally in your browser. If you use AI features, only single frames are sent for analysis, never your entire video." },
    { question: "What video formats are supported?", answer: "We support any video format that your browser supports (MP4, WebM, MOV, AVI, etc.). If it plays in Chrome or Firefox, it works here." },
    { question: "Can I capture frames from YouTube?", answer: "Yes, simply paste the YouTube URL. Note that browser restrictions may limit the maximum resolution for streamed content compared to local files." },
];

export const FAQSection: React.FC = () => (
    <div className="container mx-auto px-4 py-32 relative z-20 max-w-4xl border-t border-white/5">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="text-center mb-16 relative">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-bold uppercase tracking-widest mb-6 border border-cyan-500/20 backdrop-blur-sm">
                <span className="text-lg">❓</span>
                FAQ
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold theme-text mb-4">
                Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Questions</span>
            </h2>
            <p className="theme-text-muted text-lg">Everything you need to know about the platform.</p>
        </div>

        <div className="flex flex-col gap-4 relative">
            {faqs.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
            ))}
        </div>
    </div>
);
