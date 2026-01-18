// YouTube Proxy API using Cobalt.tools (free, reliable YouTube extraction)
// Vercel Node.js Serverless Function

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { url: videoUrl } = req.query;

    if (!videoUrl || typeof videoUrl !== 'string') {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        // Check if it's a YouTube URL
        const ytMatch = videoUrl.match(
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        );

        if (!ytMatch) {
            return res.status(400).json({
                error: 'Invalid YouTube URL. For direct video URLs (.mp4, .webm), load them directly.'
            });
        }

        // Use Cobalt API - a free, open-source YouTube extraction service
        const cobaltResponse = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: videoUrl,
                vQuality: '720',
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
            return res.status(400).json({
                error: cobaltData.text || 'Failed to extract video',
            });
        }

        // Get the video URL from response
        let streamUrl = null;

        if (cobaltData.status === 'redirect' && cobaltData.url) {
            streamUrl = cobaltData.url;
        } else if (cobaltData.status === 'stream' && cobaltData.url) {
            streamUrl = cobaltData.url;
        } else if (cobaltData.status === 'picker' && cobaltData.picker?.length > 0) {
            const videoOption = cobaltData.picker.find(p => p.type === 'video') || cobaltData.picker[0];
            streamUrl = videoOption?.url;
        }

        if (!streamUrl) {
            return res.status(404).json({
                error: 'Could not extract video URL',
                details: cobaltData,
            });
        }

        // Redirect to the video stream
        return res.redirect(302, streamUrl);

    } catch (error) {
        console.error('YouTube Proxy Error:', error);

        return res.status(500).json({
            error: 'Failed to process YouTube video',
            message: error.message,
            tip: 'If this persists, try using a direct video URL (.mp4, .webm) or download the video first.'
        });
    }
}
