import ytdl from 'ytdl-core';

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Validate URL
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // Get Video Info
        const info = await ytdl.getInfo(url);

        // Choose Format: Best video+audio specifically for compatibility (mp4) or just pipes
        // 'messy' but compatible: 'highest' quality often separates video/audio tracks in YouTube DASH
        // 'highestaudio' + 'highestvideo' needs merging (ffmpeg), which Vercel doesn't have easily.
        // SAFE BET: 'ios' compatible formats (mp4 with audio/video combined) i.e. itag 18 (360p) or 22 (720p)
        // Filter for containers that have both video and audio
        const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });

        if (!format) {
            return res.status(404).json({ error: 'No suitable video format found' });
        }

        // Redirect to the direct video URL (googlevideo.com)
        // This is better for bandwidth than piping through Vercel (which has 10s timeout/limits)
        // Most browsers can handle the googlevideo link if we just redirect.
        // HOWEVER, googlevideo links are sometimes IP-locked to the requestor.
        // If Vercel requests it, but User plays it, it might FAIL (403 Forbidden).
        // Let's try redirect first (less bandwidth). If fail, we must pipe.
        // Actually, 'ytdl-core' gets a signed URL. IP locking is complex. 
        // Usually, piping is safer for "proxy", but Vercel has execution time limits (10s on free).
        // Piping a 10-minute video will timeout.
        // SO: We MUST Redirect.

        // Enabling CORS
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );

        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        res.redirect(302, format.url);

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: 'Failed to process video', details: error.message });
    }
}
