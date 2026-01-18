
import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import ToolPage from './components/ToolPage';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';
import CookiePolicy from './components/legal/CookiePolicy';
import FAQPage from './components/legal/FAQPage';
import BlogPage from './components/BlogPage';
import { ToastProvider } from './components/context/ToastContext';
import { ThemeProvider } from './components/context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';

type View = 'home' | 'tool' | 'privacy' | 'terms' | 'cookies' | 'faq' | 'blog';

const pageTitles: Record<View, string> = {
    home: 'Catch My Frame | Professional Video Frame Extraction',
    tool: 'Studio | Catch My Frame',
    privacy: 'Privacy Policy | Catch My Frame',
    terms: 'Terms of Service | Catch My Frame',
    cookies: 'Cookie Policy | Catch My Frame',
    faq: 'FAQ | Catch My Frame',
    blog: 'Blog | Catch My Frame',
};

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('home');

    useEffect(() => {
        document.title = pageTitles[currentView];
    }, [currentView]);

    const handleNavigate = (view: string) => {
        setCurrentView(view as View);
        window.scrollTo(0, 0);
    };

    const handleLaunchTool = () => {
        setCurrentView('tool');
        window.scrollTo(0, 0);
    };

    const handleBackToHome = () => {
        setCurrentView('home');
        window.scrollTo(0, 0);
    };

    const renderView = () => {
        switch (currentView) {
            case 'tool':
                return <ToolPage />;
            case 'privacy':
                return <PrivacyPolicy onBack={handleBackToHome} />;
            case 'terms':
                return <TermsOfService onBack={handleBackToHome} />;
            case 'cookies':
                return <CookiePolicy onBack={handleBackToHome} />;
            case 'faq':
                return <FAQPage onBack={handleBackToHome} />;
            case 'blog':
                return <BlogPage onBack={handleBackToHome} />;
            case 'home':
            default:
                return <HomePage onLaunchTool={handleLaunchTool} onNavigate={handleNavigate} />;
        }
    };

    return (
        <ThemeProvider>
            <ToastProvider>
                <ErrorBoundary>
                    {renderView()}
                </ErrorBoundary>
            </ToastProvider>
        </ThemeProvider>
    );
};

export default App;

