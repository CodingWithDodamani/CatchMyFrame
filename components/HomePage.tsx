
import React from 'react';
import { HeroSection } from './ui/dynamic-hero';
import { DiamondIcon } from './icons';
import { Footer } from './Footer';
import { PricingSection } from './Pricing';
import {
    FeaturesSection,
    HowItWorksSection,
    TestimonialsSection,
    FAQSection,
    CTASection
} from './sections';

interface HomePageProps {
    onLaunchTool: () => void;
    onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLaunchTool, onNavigate }) => {
    const navItems = [
        { id: 'home', label: 'Home', href: '#' },
        { id: 'features', label: 'Features', href: '#features' },
        { id: 'services', label: 'Services', href: '#services' },
        { id: 'pricing', label: 'Pricing', href: '#pricing' },
        { id: 'about', label: 'About', href: '#about' },
        { id: 'contact', label: 'Contact', href: '#contact' },
        { id: 'launch-tool', label: 'Get Started', onClick: onLaunchTool },
    ];

    return (
        <div className="theme-bg theme-text min-h-screen relative overflow-hidden selection:bg-indigo-500/30">
            {/* Enhanced Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-1/4 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-indigo-500 opacity-20 blur-[120px] animate-pulse"></div>
                <div className="absolute right-0 bottom-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500 opacity-15 blur-[150px]"></div>
                <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]"></div>
                <div className="absolute right-1/4 top-1/3 -z-10 h-[300px] w-[300px] rounded-full bg-pink-500/10 blur-[100px]"></div>
            </div>

            <HeroSection
                heading="Unlock the Perfect Frame."
                tagline="The professional workspace for capturing high-fidelity stills from video. Precision controls, AI detection, and instant editing — all in your browser."
                buttonText="Launch Studio"
                imageUrl="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop"
                videoUrl="https://cdn.pixabay.com/video/2020/05/25/40131-424930030_large.mp4"
                navItems={navItems}
                onButtonClick={onLaunchTool}
            />

            <FeaturesSection />
            <HowItWorksSection />
            <TestimonialsSection />
            <PricingSection />
            <FAQSection />

            <CTASection onLaunch={onLaunchTool} />
            <Footer onNavigate={onNavigate} />
        </div>
    );
};

export default HomePage;
