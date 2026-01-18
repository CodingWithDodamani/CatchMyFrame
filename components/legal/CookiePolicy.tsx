
import React from 'react';
import { LegalLayout } from './LegalLayout';

interface CookiePolicyProps {
    onBack: () => void;
}

const CookiePolicy: React.FC<CookiePolicyProps> = ({ onBack }) => {
    return (
        <LegalLayout title="Cookie Policy" lastUpdated="January 18, 2026" onBack={onBack}>
            <section className="space-y-6">
                <p className="text-lg leading-relaxed">
                    This Cookie Policy explains how Catch My Frame uses cookies and similar technologies to recognize you when you visit our website.
                </p>

                <h3>What are cookies?</h3>
                <p>
                    Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                </p>

                <h3>How we use cookies</h3>
                <p>
                    Actually, <strong>we don't use traditional tracking cookies</strong>. Instead, we use your browser's "Local Storage" to save your personal preferences on your device.
                </p>

                <h3>Local Storage Data</h3>
                <p>
                    We store the following data on your device to improve your experience:
                </p>
                <div className="overflow-hidden border theme-border rounded-xl mt-4">
                    <table className="min-w-full divide-y theme-border-secondary">
                        <thead className="theme-bg-secondary">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">Key Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium theme-text-muted uppercase tracking-wider">Purpose</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y theme-border-secondary">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono theme-text-secondary">theme</td>
                                <td className="px-6 py-4 text-sm theme-text-secondary">Remembers your preference for Dark or Light mode.</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono theme-text-secondary">frameGrabberSettings</td>
                                <td className="px-6 py-4 text-sm theme-text-secondary">Saves your export preferences (JPG/PNG, DPI, etc.) so you don't have to reset them every visit.</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono theme-text-secondary">fg-hasSeenOnboarding</td>
                                <td className="px-6 py-4 text-sm theme-text-secondary">Ensures we only show you the tutorial tour once.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h3 className="mt-8">Managing preferences</h3>
                <p>
                    Since this data is stored locally on your device, you can clear it at any time by clearing your browser's browsing data/cache.
                </p>
            </section>
        </LegalLayout>
    );
};

export default CookiePolicy;
