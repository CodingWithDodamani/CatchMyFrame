
import React from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
    name: string;
    role: string;
    quote: string;
    avatar: string;
    rating: number;
}

const testimonials: Testimonial[] = [
    {
        name: "Priya Sharma",
        role: "Medical Student (NEET PG)",
        quote: "I use this to grab high-yield diagrams from pathology lectures. It saves me hours of pausing and screenshotting. A must-have for competitive exams.",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
        rating: 5
    },
    {
        name: "James Wilson",
        role: "Online Educator & YouTuber",
        quote: "Creating study guides from my own tutorials used to be a pain. Now I can extract clean, high-res slides for my students in seconds. It's transformed my teaching workflow.",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        rating: 5
    },
    {
        name: "Arjun Reddy",
        role: "UPSC Aspirant",
        quote: "The frame-by-frame precision helps me capture specific maps and data points from current affairs videos without any blur. Essential for my daily notes.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        rating: 5
    }
];

export const TestimonialsSection: React.FC = () => (
    <div id="about" className="container mx-auto px-4 py-32 relative z-20 border-t border-white/5">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-yellow-500/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="text-center mb-20 relative">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-bold uppercase tracking-widest mb-6 border border-yellow-500/20 backdrop-blur-sm">
                <Star className="w-4 h-4" fill="currentColor" strokeWidth={0} />
                Testimonials
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold theme-text mb-6 leading-tight">
                Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Learners & Creators</span>
            </h2>
            <p className="theme-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
                Join thousands of students, teachers, and professionals who rely on Catch My Frame.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((t, i) => (
                <div key={i} className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-yellow-500/30 overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]">
                    {/* Decorative gradient blur */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                    {/* Quote Icon */}
                    <Quote className="absolute top-6 right-6 w-16 h-16 text-indigo-500/5 group-hover:text-yellow-500/10 transition-colors duration-500" strokeWidth={1} />

                    {/* Star Rating */}
                    <div className="flex gap-1 mb-6 relative z-10">
                        {[...Array(t.rating)].map((_, j) => (
                            <div key={j} className="relative">
                                <Star className="w-5 h-5 text-yellow-500" fill="currentColor" strokeWidth={0} />
                                <div className="absolute inset-0 blur-sm">
                                    <Star className="w-5 h-5 text-yellow-500/50" fill="currentColor" strokeWidth={0} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quote */}
                    <p className="theme-text-secondary mb-8 text-lg leading-relaxed relative z-10 italic">"{t.quote}"</p>

                    {/* Author Info */}
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="relative">
                            <img
                                src={t.avatar}
                                alt={t.name}
                                className="w-14 h-14 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-yellow-500/40 transition-all duration-300"
                            />
                            <div className="absolute inset-0 rounded-full ring-2 ring-yellow-500/0 group-hover:ring-yellow-500/30 group-hover:scale-110 transition-all duration-500"></div>
                        </div>
                        <div>
                            <div className="theme-text font-bold text-lg">{t.name}</div>
                            <div className="text-yellow-400/80 text-sm font-medium">{t.role}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
