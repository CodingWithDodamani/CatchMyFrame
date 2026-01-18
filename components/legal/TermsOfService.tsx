
import React from 'react';
import { LegalLayout } from './LegalLayout';

interface TermsOfServiceProps {
    onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
    return (
        <LegalLayout title="Terms of Service" lastUpdated="January 18, 2026" onBack={onBack}>
            <section className="space-y-6">
                <p className="text-lg leading-relaxed">
                    Welcome to Catch My Frame. By accessing or using our website, you agree to be bound by these Terms of Service.
                </p>

                <h3>1. Use License</h3>
                <p>
                    Permission is granted to use Catch My Frame for personal or commercial purposes, subject to the following restrictions:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>You may not use the tool for any illegal or unauthorized purpose.</li>
                    <li>You agree not to attempt to reverse engineer or disrupt the service.</li>
                </ul>

                <h3>2. Intellectual Property</h3>
                <p>
                    The captured frames and images you create using our tool belong to you (or the original copyright holder of the video). Catch My Frame claims no ownership over your generated content.
                </p>

                <h3>3. Disclaimer</h3>
                <p>
                    The materials on Catch My Frame are provided on an 'as is' basis. We make no warranties, expressed or implied, regarding the reliability or accuracy of the tool for critical purposes.
                </p>
                <p>
                    Since video processing happens on your device, performance depends on your hardware capabilities. We are not responsible for browser crashes or data loss during editing.
                </p>

                <h3>4. External Links</h3>
                <p>
                    Our service may contain links to third-party web sites (e.g., YouTube) that are not owned or controlled by Catch My Frame. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third party web sites or services.
                </p>

                <h3>5. Changes</h3>
                <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
                </p>
            </section>
        </LegalLayout>
    );
};

export default TermsOfService;
