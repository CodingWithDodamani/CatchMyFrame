import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    className?: string;
    imageClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ src, className, imageClassName, alt, ...props }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            });
        }, {
            rootMargin: '200px' // Load images 200px before they appear
        });

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden bg-gray-900 ${className}`}
        >
            {isVisible && (
                <img
                    src={src}
                    alt={alt || ''}
                    className={`w-full h-full object-contain transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imageClassName || ''}`}
                    onLoad={() => setIsLoaded(true)}
                    {...props}
                />
            )}

            {/* Loading Placeholder Skeleton */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 animate-pulse">
                    <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )}
        </div>
    );
};
