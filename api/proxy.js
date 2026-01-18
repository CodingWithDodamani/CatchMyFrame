// YouTube Proxy API for Vercel Serverless Function
// Uses @distube/ytdl-core which is more actively maintained

export const config = {
    runtime: 'edge', // Use edge runtime for better performance
};

export default async function handler(request) {
    const url = new URL(request.url);
    const videoUrl = url.searchParams.get('url');

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (!videoUrl || typeof videoUrl !== 'string') {
        return new Response(
            JSON.stringify({ error: 'URL parameter is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    try {
        // Check if it's a YouTube URL
        const ytMatch = videoUrl.match(
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        );

        if (!ytMatch) {
            // Not a YouTube URL - try to proxy the direct URL
            return new Response(
                JSON.stringify({ error: 'Invalid YouTube URL. For direct video URLs, load them directly in the browser.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const videoId = ytMatch[1];

        // Use YouTube's embed player info endpoint (more reliable than scraping)
        // This gets a playable stream URL
        const infoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // Try using an alternative approach - get the video info
        const response = await fetch(infoUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch video info');
        }

        const html = await response.text();

        // Extract player response from the page
        const playerResponseMatch = html.match(/var ytInitialPlayerResponse = ({.+?});/);

        if (!playerResponseMatch) {
            throw new Error('Could not extract video data from YouTube');
        }

        const playerResponse = JSON.parse(playerResponseMatch[1]);

        // Check if video is playable
        if (playerResponse.playabilityStatus?.status !== 'OK') {
            const reason = playerResponse.playabilityStatus?.reason || 'Video is not available';
            return new Response(
                JSON.stringify({ error: reason }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get streaming data
        const streamingData = playerResponse.streamingData;

        if (!streamingData) {
            throw new Error('No streaming data available');
        }

        // Prefer formats with both audio and video
        let formats = streamingData.formats || [];

        if (formats.length === 0) {
            // Fall back to adaptive formats (may need merging)
            formats = streamingData.adaptiveFormats || [];
        }

        // Find the best format with audio+video
        const format = formats.find(f => f.mimeType?.includes('video/mp4') && f.audioQuality)
            || formats.find(f => f.mimeType?.includes('video/'))
            || formats[0];

        if (!format || !format.url) {
            // Try to return format info for debugging
            return new Response(
                JSON.stringify({
                    error: 'No playable format found',
                    videoId,
                    availableFormats: formats.length
                }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Return the direct video URL (redirect)
        return Response.redirect(format.url, 302);

    } catch (error) {
        console.error('YouTube Proxy Error:', error);

        return new Response(
            JSON.stringify({
                error: 'Failed to process YouTube video',
                message: error.message,
                tip: 'YouTube frequently changes their systems. Try using a direct video URL (.mp4, .webm) instead.'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
}
