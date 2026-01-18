
import React from 'react';
import { LegalLayout } from './LegalLayout';

interface PrivacyPolicyProps {
    onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
    return (
        <LegalLayout title="Privacy Policy" lastUpdated="January 18, 2026" onBack={onBack}>
            <section className="space-y-6">
                <p className="text-lg leading-relaxed">
                    At Catch My Frame, we prioritize your privacy above all else. This Privacy Policy explains how we handle your data when you use our video frame extraction tool.
                </p>

                <h3>1. Local Processing</h3>
                <p>
                    Catch My Frame is designed as a client-side application. This means:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>No Video Uploads:</strong> Your video files are processed entirely within your web browser. They are never uploaded to our servers or any third-party cloud storage.</li>
                    <li><strong>No Data Retention:</strong> Since we don't receive your files, we cannot store, view, or share your content.</li>
                </ul>

                <h3>2. AI Features (Optional)</h3>
                <p>
                    If you choose to use our AI Scene Detection features:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>We generate <strong>low-resolution screenshots</strong> of specific frames to analyze layout changes.</li>
                    <li>These single frames are temporarily sent to the Google Gemini AI API for analysis.</li>
                    <li>These images are not used to train AI models and are discarded after analysis, subject to Google's API data usage policies.</li>
                    <li>This feature is strictly optional and only activates when you click "AI Smart Detect".</li>
                </ul>

                <h3>3. Data Collection</h3>
                <p>
                    We do not collect personal usage data, account information, or track your browsing history.
                    We may use basic, anonymous analytics (e.g., Vercel Analytics) to monitor website performance (page load speeds, error rates) which does not identify you personally.
                </p>

                <h3>4. Local Storage</h3>
                <p>
                    We use your browser's Local Storage to save your preferences, such as:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Theme settings (Dark/Light mode)</li>
                    <li>Default export format (JPEG/PNG)</li>
                    <li>Onboarding status (so you don't see the tutorial every time)</li>
                </ul>
                <p>
                    You can clear this data at any time by clearing your browser's cache for our site.
                </p>

                <h3>5. Contact Us</h3>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@catchmyframe.com">hello@catchmyframe.com</a>.
                </p>
            </section>
        </LegalLayout>
    );
};

export default PrivacyPolicy;
