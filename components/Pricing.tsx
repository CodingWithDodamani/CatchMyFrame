import React from 'react';
import { Check, Zap, Gem, BrainCircuit, Sparkles, Clock, Rocket, ArrowRight } from 'lucide-react';

interface PricingCardProps {
    title: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    isHighlighted?: boolean;
    isComingSoon?: boolean;
    buttonText?: string;
    icon: React.ReactNode;
    accentColor: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
    title,
    price,
    period,
    description,
    features,
    isPopular = false,
    isHighlighted = false,
    isComingSoon = false,
    buttonText = "Get Started",
    icon,
    accentColor
}) => {
    return (
        <div className={`relative group transition-all duration-500 ${!isComingSoon ? 'hover:-translate-y-3' : ''}`}>
            {/* Animated Glow Background */}
            {isHighlighted && (
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 rounded-3xl opacity-40 blur-xl group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
            )}

            {/* Card Container */}
            <div className={`relative p-6 rounded-2xl border backdrop-blur-xl overflow-hidden h-full flex flex-col ${isHighlighted
                ? 'bg-gradient-to-br from-emerald-950/90 via-green-950/80 to-teal-950/90 border-emerald-400/50'
                : isComingSoon
                    ? 'bg-slate-950/60 border-white/5'
                    : 'bg-gradient-to-br from-slate-900/90 to-slate-950/95 border-white/10 hover:border-white/20'
                }`}>

                {/* Decorative Corner Gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${accentColor}`}></div>
                <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl opacity-10 ${accentColor}`}></div>

                {/* Floating Particles for Highlighted */}
                {isHighlighted && (
                    <>
                        <div className="absolute top-4 right-4 w-1 h-1 bg-emerald-400 rounded-full animate-ping"></div>
                        <div className="absolute top-12 right-8 w-0.5 h-0.5 bg-green-300 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-16 left-6 w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                    </>
                )}

                {/* Top Badge */}
                {isHighlighted && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 blur-md opacity-60"></div>
                            <div className="relative px-4 py-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-b-xl text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                <Sparkles className="w-3 h-3 animate-pulse" />
                                Limited Offer
                                <Sparkles className="w-3 h-3 animate-pulse" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Coming Soon Overlay */}
                {isComingSoon && (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-950/80 to-black/90 z-10"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-pink-500/50 blur-xl"></div>
                                <div className="relative px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 rounded-xl text-white font-semibold uppercase tracking-wider shadow-2xl flex items-center gap-2 -rotate-3 border border-white/20">
                                    <Rocket className="w-4 h-4 animate-bounce" />
                                    Coming Soon
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Content */}
                <div className={`relative z-0 flex flex-col h-full ${isHighlighted ? 'pt-4' : ''}`}>

                    {/* Icon & Title */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${isHighlighted
                            ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/20 text-emerald-400 ring-1 ring-emerald-400/30 group-hover:ring-emerald-400/50'
                            : isComingSoon
                                ? 'bg-white/5 text-gray-600'
                                : 'bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-white/10'
                            }`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${isComingSoon ? 'text-gray-500' : 'text-white'}`}>{title}</h3>
                            <p className={`text-xs ${isComingSoon ? 'text-gray-700' : 'text-gray-500'}`}>{description}</p>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="mb-5">
                        <div className="flex items-baseline gap-1">
                            <span className={`text-4xl font-bold tracking-tight ${isHighlighted
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300'
                                : isComingSoon
                                    ? 'text-gray-600'
                                    : 'text-white'
                                }`}>{price}</span>
                            <span className={`text-sm ${isComingSoon ? 'text-gray-700' : 'text-gray-500'}`}>{period}</span>
                        </div>
                        {isHighlighted && (
                            <div className="mt-1 text-[10px] text-emerald-400/80 font-medium">✨ Best value for starters</div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className={`h-px mb-5 ${isHighlighted
                        ? 'bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent'
                        : 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
                        }`}></div>

                    {/* Features */}
                    <div className="flex-1 space-y-3 mb-6">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2.5">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isHighlighted
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : isComingSoon
                                        ? 'bg-white/5 text-gray-700'
                                        : 'bg-white/5 text-gray-500'
                                    }`}>
                                    <Check className="w-3 h-3" strokeWidth={2.5} />
                                </div>
                                <span className={`text-sm ${isComingSoon ? 'text-gray-600' : 'text-gray-300'}`}>{feature}</span>
                            </div>
                        ))}
                    </div>

                    {/* Button */}
                    <button
                        disabled={isComingSoon}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isHighlighted
                            ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:via-green-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]'
                            : isComingSoon
                                ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 group-hover:border-white/30'
                            }`}>
                        {isComingSoon ? (
                            <>
                                <Clock className="w-4 h-4" />
                                Notify Me
                            </>
                        ) : (
                            <>
                                {isHighlighted && <Rocket className="w-4 h-4" />}
                                {buttonText}
                                <ArrowRight className={`w-4 h-4 transition-transform ${isHighlighted ? 'group-hover:translate-x-1' : ''}`} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const PricingSection: React.FC = () => {
    return (
        <div id="pricing" className="container mx-auto px-4 py-16 sm:py-20 lg:py-24 relative z-20">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <div className="text-center mb-16 relative">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 text-xs font-bold uppercase tracking-widest mb-5 border border-green-500/20 backdrop-blur-sm">
                    <Gem className="w-3.5 h-3.5" />
                    Pricing
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold theme-text mb-4">
                    Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">Perfect Plan</span>
                </h2>
                <p className="theme-text-muted max-w-lg mx-auto text-sm sm:text-base px-4 sm:px-0">
                    Start free, upgrade anytime. No hidden fees, no surprises.
                </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto items-stretch">

                {/* Starter Plan - HIGHLIGHTED */}
                <PricingCard
                    title="Starter"
                    price="$0"
                    period="/forever"
                    description="Perfect for quick grabs"
                    icon={<Zap className="w-5 h-5" strokeWidth={1.5} />}
                    isHighlighted={true}
                    buttonText="Start Free"
                    accentColor="bg-emerald-500"
                    features={[
                        "Unlimited captures",
                        "1080p Export Quality",
                        "Basic Editing Tools",
                        "JPG & PNG Export",
                        "Community Support"
                    ]}
                />

                {/* Pro Plan - COMING SOON */}
                <PricingCard
                    title="Pro"
                    price="$12"
                    period="/month"
                    description="For power users"
                    isPopular={true}
                    isComingSoon={true}
                    buttonText="Start Trial"
                    accentColor="bg-indigo-500"
                    icon={<Gem className="w-5 h-5" strokeWidth={1.5} />}
                    features={[
                        "Everything in Starter",
                        "4K & 8K Export",
                        "AI Scene Detection",
                        "Batch Processing",
                        "Advanced Filters",
                        "Priority Support"
                    ]}
                />

                {/* Team Plan - COMING SOON */}
                <PricingCard
                    title="Team"
                    price="$49"
                    period="/month"
                    description="For teams & agencies"
                    isComingSoon={true}
                    buttonText="Contact Sales"
                    accentColor="bg-purple-500"
                    icon={<BrainCircuit className="w-5 h-5" strokeWidth={1.5} />}
                    features={[
                        "Everything in Pro",
                        "Unlimited AI Credits",
                        "Team Workspace",
                        "Cloud Sync",
                        "Custom Branding",
                        "Account Manager"
                    ]}
                />

            </div>

            {/* Bottom Trust Badge */}
            <div className="mt-8 sm:mt-12 text-center">
                <p className="text-gray-500 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    No credit card required • Cancel anytime • 100% secure
                </p>
            </div>
        </div>
    );
};
