
import React, { useState } from 'react';
import {
    Github,
    Twitter,
    Linkedin,
    Instagram,
    Mail,
    Phone,
    ArrowRight,
    Gem,
    ExternalLink
} from 'lucide-react';

interface FooterProps {
    onNavigate: (page: string) => void;
}

const SocialIcon: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => (
    <a
        href={href}
        aria-label={label}
        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:scale-110 transition-all duration-300 border border-white/5 hover:border-indigo-500/50 shadow-sm hover:shadow-indigo-500/20"
    >
        {icon}
    </a>
);

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setTimeout(() => setSubscribed(false), 3000);
            setEmail('');
        }
    };

    return (
        <footer className="relative z-10 pt-12 sm:pt-20 pb-8 sm:pb-10 border-t border-white/5 bg-[#0a0a0c] overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="container mx-auto px-4 relative">

                {/* Top Section: Newsletter & Brand */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-24 mb-10 sm:mb-16 items-start">

                    {/* Brand Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Gem className="w-6 h-6 text-white" strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Catch My Frame</h3>
                                <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase">Professional Studio</p>
                            </div>
                        </div>
                        <p className="text-gray-400 leading-relaxed max-w-md text-base sm:text-lg">
                            The ultimate browser-based tool for extracting high-fidelity stills from any video source. Private, lossless, and instant.
                        </p>

                        <div className="flex gap-3 pt-2">
                            <SocialIcon href="#" label="GitHub" icon={<Github className="w-5 h-5" strokeWidth={1.5} />} />
                            <SocialIcon href="#" label="Twitter" icon={<Twitter className="w-5 h-5" strokeWidth={1.5} />} />
                            <SocialIcon href="#" label="LinkedIn" icon={<Linkedin className="w-5 h-5" strokeWidth={1.5} />} />
                            <SocialIcon href="#" label="Instagram" icon={<Instagram className="w-5 h-5" strokeWidth={1.5} />} />
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="lg:pl-10">
                        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                            <h4 className="text-lg sm:text-xl font-bold text-white mb-2 relative z-10">Join the Studio Community</h4>
                            <p className="text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm relative z-10">Get the latest updates, feature releases, and pro tips delivered to your inbox.</p>

                            <form onSubmit={handleSubscribe} className="relative z-10">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                                    >
                                        {subscribed ? 'Joined!' : 'Subscribe'}
                                        {!subscribed && <ArrowRight className="w-4 h-4" strokeWidth={2} />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-3 pl-1">
                                    We respect your privacy. Unsubscribe at any time.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16"></div>

                {/* Bottom Grid: Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-20">
                    <div>
                        <h4 className="font-bold text-white text-sm sm:text-base mb-4 sm:mb-6">Product</h4>
                        <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-400">
                            <li><a href="#features" className="hover:text-indigo-400 transition-colors block">Features</a></li>
                            <li><a href="#services" className="hover:text-indigo-400 transition-colors block">Workflow</a></li>
                            <li><a href="#about" className="hover:text-indigo-400 transition-colors block">Testimonials</a></li>
                            <li><a href="#pricing" className="hover:text-indigo-400 transition-colors block">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm sm:text-base mb-4 sm:mb-6">Resources</h4>
                        <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-400">
                            <li><button onClick={() => onNavigate('faq')} className="hover:text-indigo-400 transition-colors text-left w-full">Documentation</button></li>
                            <li><button onClick={() => onNavigate('faq')} className="hover:text-indigo-400 transition-colors text-left w-full">FAQ</button></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors block">Community</a></li>
                            <li><button onClick={() => onNavigate('blog')} className="hover:text-indigo-400 transition-colors block text-left w-full">Blog</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm sm:text-base mb-4 sm:mb-6">Legal</h4>
                        <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-400">
                            <li><button onClick={() => onNavigate('privacy')} className="hover:text-indigo-400 transition-colors text-left w-full flex items-center gap-2">Privacy Policy</button></li>
                            <li><button onClick={() => onNavigate('terms')} className="hover:text-indigo-400 transition-colors text-left w-full flex items-center gap-2">Terms of Service</button></li>
                            <li><button onClick={() => onNavigate('cookies')} className="hover:text-indigo-400 transition-colors text-left w-full flex items-center gap-2">Cookie Policy</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-sm sm:text-base mb-4 sm:mb-6">Contact</h4>
                        <ul className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-400">
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 text-indigo-500 mt-0.5" strokeWidth={1.5} />
                                <div>
                                    <div className="text-xs text-gray-500 mb-0.5">Support Email</div>
                                    <a href="mailto:support@catchmyframe.com" className="text-white hover:text-indigo-400 transition-colors">support@catchmyframe.com</a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-indigo-500 mt-0.5" strokeWidth={1.5} />
                                <div>
                                    <div className="text-xs text-gray-500 mb-0.5">Business Inquiries</div>
                                    <a href="mailto:partners@catchmyframe.com" className="text-white hover:text-indigo-400 transition-colors">partners@catchmyframe.com</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-white/5 text-xs sm:text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} Catch My Frame. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <span>Made with</span>
                        <span className="text-red-500 text-base">❤️</span>
                        <span>by Hallu Dodamani</span>
                    </div>
                </div>

            </div>
        </footer>
    );
};
