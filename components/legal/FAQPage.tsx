
import React from 'react';
import { LegalLayout } from './LegalLayout';

interface FAQPageProps {
    onBack: () => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ onBack }) => {
    return (
        <LegalLayout title="Frequently Asked Questions" lastUpdated="January 18, 2026" onBack={onBack}>
            <section className="space-y-8">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold theme-text">Is Catch My Frame free to use?</h3>
                    <p className="theme-text-secondary">
                        Yes! The core features of Catch My Frame are completely free. We utilize your own device's processing power, which keeps our server costs low and allows us to offer this tool for free.
                    </p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold theme-text">Are my videos uploaded to a server?</h3>
                    <p className="theme-text-secondary">
                        No. For privacy and speed, all video processing happens locally in your browser. We never upload your full video files to any cloud server.
                    </p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold theme-text">How does the "AI Scene Detection" work?</h3>
                    <p className="theme-text-secondary">
                        When you enable AI mode, we take small, low-resolution snapshots of your video and send them to Google's Gemini AI for analysis. The AI simply answers "Yes" or "No" if it sees a new slide or scene. The image is then discarded. Your full video is never sent.
                    </p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold theme-text">What video formats do you support?</h3>
                    <p className="theme-text-secondary">
                        We support any video format that your browser natively supports. This typically includes MP4, WebM, MOV, and M4V. If your file is a more obscure format (like MKV needs codec support), it might not play directly.
                    </p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold theme-text">Why does screen capture look different on YouTube?</h3>
                    <p className="theme-text-secondary">
                        Browsers often protect DRM content (like Netflix/Hulu) from being captured, resulting in a black screen. For YouTube, we use a special proxy or screen sharing method to get around standard restrictions, but quality is sometimes limited by your screen resolution.
                    </p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-bold theme-text">Can I use the images I capture commercially?</h3>
                    <p className="theme-text-secondary">
                        The tool itself places no restrictions on your images. However, the copyright of the images depends on the source video. If you own the video, you own the frames!
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
};

export default FAQPage;
