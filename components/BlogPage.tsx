
import React, { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from './icons';

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: React.ReactNode;
    author: string;
    date: string;
    readTime: string;
    imageUrl: string;
    category: string;
}

const articles: BlogPost[] = [
    {
        id: 'stop-screenshotting',
        title: "Stop Screenshotting: Why Frame Extraction is Better",
        excerpt: "Screenshots are compressed, lower resolution, and often include unwanted UI elements. Learn why dedicated frame extraction is the professional choice.",
        author: "Hallu Dodamani",
        date: "Oct 24, 2023",
        readTime: "5 min read",
        imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop",
        category: "Education",
        content: (
            <>
                <p className="mb-6">
                    We've all been there: you're watching a tutorial or a visually stunning video, and you see a moment you need to save. Instinctively, your fingers reach for <code>PrntScrn</code> or <code>Cmd+Shift+4</code>. But stop right there. You're compromising quality.
                </p>
                <h3 className="text-2xl font-bold text-white mb-4">The Problem with Screenshots</h3>
                <p className="mb-6">
                    Screenshots capture what your <em>screen</em> displays, not what the <em>video file</em> contains. If you're watching a 4K video on a 1080p monitor, your screenshot is only 1080p.
                    Furthermore, operating systems and browsers apply compression to the video stream to ensure smooth playback, and then apply <em>more</em> compression when saving the screenshot to your clipboard or desktop.
                </p>
                <h3 className="text-2xl font-bold text-white mb-4">The Frame Extraction Advantage</h3>
                <p className="mb-6">
                    Catch My Frame accesses the raw video data. When you extract a frame, you are pulling the exact pixel data from that specific millisecond of the video file.
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li><strong>Full Resolution:</strong> Get the detailed 4K or 8K image regardless of your screen size.</li>
                    <li><strong>No UI Clutter:</strong> No play bars, mouse cursors, or subtitles overlaying your image.</li>
                    <li><strong>Color Accuracy:</strong> Preserve the original color grading without OS color profile interference.</li>
                </ul>
                <p>
                    Next time you need a still, don't just grab it—extract it. Your audience will notice the difference.
                </p>
            </>
        )
    },
    {
        id: 'ai-video-workflow',
        title: "How AI is Changing Video Workflows",
        excerpt: "Manual scrubbing is a thing of the past. Discover how Gemini AI helps you find the perfect moment in seconds, not minutes.",
        author: "Hallu Dodamani",
        date: "Nov 12, 2023",
        readTime: "4 min read",
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop",
        category: "Technology",
        content: (
            <>
                <p className="mb-6">
                    Video editing is tedious. Finding "that one shot" where the subject smiles, the lighting is perfect, and the motion blur is minimal can take hours of timeline scrubbing. Artificial Intelligence is here to change that.
                </p>
                <h3 className="text-2xl font-bold text-white mb-4">Semantic Search for Video</h3>
                <p className="mb-6">
                    With improvements in multimodal models like Google's Gemini, tools like Catch My Frame can now "see" video content. Instead of looking for a timestamp, you can search for a concept.
                </p>
                <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 bg-white/5 rounded-r-lg italic mb-6">
                    "Find the moment where the red car turns the corner and the sun hits the windshield."
                </blockquote>
                <p className="mb-6">
                    This semantic understanding allows creators to index their raw footage instantly. What used to be a manual logging process is now an instant query.
                </p>
                <h3 className="text-2xl font-bold text-white mb-4">Automated Quality Control</h3>
                <p>
                    AI doesn't just find content; it assesses quality. Our new "Smart Scan" feature detects blurry frames, closed eyes, or poor lighting, automatically skipping them to suggest the technically superior frame in the sequence. This ensures that the still you grab is always publication-ready.
                </p>
            </>
        )
    },
    {
        id: '5-tips-perfect-still',
        title: "5 Tips for Capturing the Perfect Still",
        excerpt: "From frame rates to shutter angles, here are the technical secrets professional editors use to get crisp, clear images from motion video.",
        author: "Hallu Dodamani",
        date: "Dec 05, 2023",
        readTime: "6 min read",
        imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop",
        category: "Tutorial",
        content: (
            <>
                <p className="mb-6">
                    Extracting a still from a moving video is an art form. Unlike photography, where you freeze a moment intentionally, video frames often suffer from motion blur. Here is how to fight it.
                </p>
                <h3 className="text-2xl font-bold text-white mb-4">1. Shoot at Higher Shutter Speeds</h3>
                <p className="mb-6">
                    If you know you'll be pulling stills, break the "180-degree shutter rule". Shooting at 1/100 or 1/200 shutter speed reduces motion blur significantly, making individual frames much sharper.
                </p>
                <h3 className="text-2xl font-bold text-white mb-4">2. Look for the Apex of Motion</h3>
                <p className="mb-6">
                    In any movement—a jump, a turn, a smile—there is a split second where motion momentarily stops before reversing or continuing. This "apex" is your golden moment for a sharp still.
                </p>
                <h3 className="text-2xl font-bold text-white mb-4">3. Use De-Interlacing</h3>
                <p className="mb-6">
                    Older footage (1080i) often has "comb lines". Ensure your frame extraction tool has a smart de-interlacing filter enabled to merge fields correctly.
                </p>
                <h3 className="text-2xl font-bold text-white mb-4">4. Enhance with Sharpness</h3>
                <p className="mb-6">
                    Video is naturally softer than photos. A subtle 10-15% unsharp mask in our Studio Editor can bring back the "crispness" associated with high-resolution photography.
                </p>
                <h3 className="text-2xl font-bold text-white mb-4">5. Resolution Matters</h3>
                <p>
                    Always source from the highest quality file available. Extracting from a 720p proxy file will never yield a print-quality result. Use the original camera raw files whenever possible.
                </p>
            </>
        )
    }
];

interface BlogPageProps {
    onBack: () => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onBack }) => {
    const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

    const handleReadArticle = (article: BlogPost) => {
        setActiveArticle(article);
        window.scrollTo(0, 0);
    };

    const handleCloseArticle = () => {
        setActiveArticle(null);
        window.scrollTo(0, 0);
    };

    if (activeArticle) {
        return (
            <div className="min-h-screen theme-bg text-white pb-20 pt-24 px-4 relative overflow-hidden">
                {/* Background Glow */}
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-3xl mx-auto relative z-10">
                    <button
                        onClick={handleCloseArticle}
                        className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Articles
                    </button>

                    <div className="mb-6 flex items-center gap-4 text-sm text-indigo-400 font-medium uppercase tracking-wider">
                        <span>{activeArticle.category}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                        <span>{activeArticle.readTime}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">{activeArticle.title}</h1>

                    <div className="flex items-center gap-4 mb-10 pb-10 border-b border-white/10">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                            {activeArticle.author[0]}
                        </div>
                        <div>
                            <div className="font-bold">{activeArticle.author}</div>
                            <div className="text-sm text-gray-400">{activeArticle.date}</div>
                        </div>
                    </div>

                    <img
                        src={activeArticle.imageUrl}
                        alt={activeArticle.title}
                        className="w-full h-64 md:h-96 object-cover rounded-3xl mb-12 shadow-2xl ring-1 ring-white/10"
                    />

                    <div className="prose prose-lg prose-invert text-gray-300 leading-relaxed max-w-none">
                        {activeArticle.content}
                    </div>

                    <div className="mt-20 pt-10 border-t border-white/10 text-center">
                        <h3 className="text-2xl font-bold mb-6">Enjoyed this article?</h3>
                        <button
                            onClick={handleCloseArticle}
                            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                        >
                            Read more stories <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen theme-bg text-white pb-20 pt-24 px-4 relative">
            {/* Background Glow */}
            <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="flex items-center justify-between mb-16">
                    <div>
                        <button
                            onClick={onBack}
                            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group text-sm"
                        >
                            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </button>
                        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">The Studio Blog</h1>
                        <p className="text-xl text-gray-400 max-w-2xl">Insights, tutorials, and updates from the world of video editing and AI.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <article
                            key={article.id}
                            className="group rounded-3xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/[0.08] hover:border-indigo-500/30 hover:-translate-y-2 transition-all duration-500 shadow-lg"
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={article.imageUrl}
                                    alt={article.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider text-white">
                                    {article.category}
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="text-xs text-indigo-400 font-bold mb-3 uppercase tracking-wider">{article.date}</div>
                                <h2 className="text-2xl font-bold mb-4 group-hover:text-indigo-300 transition-colors lineHeight-tight">{article.title}</h2>
                                <p className="text-gray-400 mb-6 line-clamp-3 text-sm leading-relaxed">{article.excerpt}</p>
                                <button
                                    onClick={() => handleReadArticle(article)}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:gap-3 transition-all"
                                >
                                    Read Article <ArrowRightIcon className="w-4 h-4 text-indigo-400" />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
