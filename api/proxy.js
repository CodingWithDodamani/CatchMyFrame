// YouTube Proxy API using Cobalt.tools (free, reliable YouTube extraction)
// This is more reliable than parsing YouTube directly

export const config = {
    runtime: 'edge',
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
            return new Response(
                JSON.stringify({ error: 'Invalid YouTube URL. For direct video URLs (.mp4, .webm), load them directly.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Use Cobalt API - a free, open-source YouTube extraction service
        // https://github.com/imputnet/cobalt
        const cobaltResponse = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: videoUrl,
                vQuality: '720',      // 720p for good balance of quality and speed
                filenamePattern: 'basic',
                isAudioOnly: false,
                disableMetadata: true,
            }),
        });

        if (!cobaltResponse.ok) {
            const errorText = await cobaltResponse.text();
            throw new Error(`Cobalt API error: ${cobaltResponse.status} - ${errorText}`);
        }

        const cobaltData = await cobaltResponse.json();

        // Check response status
        if (cobaltData.status === 'error') {
            return new Response(
                JSON.stringify({
                    error: cobaltData.text || 'Failed to extract video',
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get the video URL from response
        let streamUrl = null;

        if (cobaltData.status === 'redirect' && cobaltData.url) {
            streamUrl = cobaltData.url;
        } else if (cobaltData.status === 'stream' && cobaltData.url) {
            streamUrl = cobaltData.url;
        } else if (cobaltData.status === 'picker' && cobaltData.picker?.length > 0) {
            // Multiple options available, pick the first video
            const videoOption = cobaltData.picker.find(p => p.type === 'video') || cobaltData.picker[0];
            streamUrl = videoOption?.url;
        }

        if (!streamUrl) {
            return new Response(
                JSON.stringify({
                    error: 'Could not extract video URL',
                    details: cobaltData,
                }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Redirect to the video stream
        return Response.redirect(streamUrl, 302);

    } catch (error) {
        console.error('YouTube Proxy Error:', error);

        return new Response(
            JSON.stringify({
                error: 'Failed to process YouTube video',
                message: error.message,
                tip: 'If this persists, try using a direct video URL (.mp4, .webm) or download the video first.'
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
}
