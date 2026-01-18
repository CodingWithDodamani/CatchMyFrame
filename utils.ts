
import { FilterConfig, SharpeningLevel } from './types';

// CRC Table and Logic
const crcTable: number[] = [];
for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
        if (c & 1) c = 0xedb88320 ^ (c >>> 1);
        else c = c >>> 1;
    }
    crcTable[n] = c;
}

const updateCrc = (crc: number, buf: Uint8Array) => {
    let c = crc;
    for (let i = 0; i < buf.length; i++) {
        c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return c;
};

const createPhysChunk = (dpi: number) => {
    const ppm = Math.round(dpi * 39.3701); // pixels per meter
    const type = new Uint8Array([112, 72, 89, 115]); // pHYs
    const data = new Uint8Array(9);

    // ppm x
    data[0] = (ppm >> 24) & 0xFF;
    data[1] = (ppm >> 16) & 0xFF;
    data[2] = (ppm >> 8) & 0xFF;
    data[3] = ppm & 0xFF;
    // ppm y
    data[4] = (ppm >> 24) & 0xFF;
    data[5] = (ppm >> 16) & 0xFF;
    data[6] = (ppm >> 8) & 0xFF;
    data[7] = ppm & 0xFF;
    data[8] = 1; // unit: meter

    // CRC
    let crc = 0xffffffff;
    crc = updateCrc(crc, type);
    crc = updateCrc(crc, data);
    crc = crc ^ 0xffffffff;

    const chunk = new Uint8Array(4 + 4 + 9 + 4);
    let offset = 0;
    // Length (9)
    chunk[offset++] = 0;
    chunk[offset++] = 0;
    chunk[offset++] = 0;
    chunk[offset++] = 9;
    // Type
    chunk.set(type, offset); offset += 4;
    // Data
    chunk.set(data, offset); offset += 9;
    // CRC
    chunk[offset++] = (crc >> 24) & 0xFF;
    chunk[offset++] = (crc >> 16) & 0xFF;
    chunk[offset++] = (crc >> 8) & 0xFF;
    chunk[offset++] = crc & 0xFF;

    return chunk;
};

export const injectDpi = (dataUrl: string, dpi: number): string => {
    const header = "data:image/";
    const typeEnd = dataUrl.indexOf(";");
    if (typeEnd === -1) return dataUrl;

    const type = dataUrl.substring(header.length, typeEnd);
    const base64Index = dataUrl.indexOf("base64,");
    if (base64Index === -1) return dataUrl;

    const base64 = dataUrl.substring(base64Index + 7);
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        buffer[i] = binary.charCodeAt(i);
    }

    if (type === 'jpeg' || type === 'jpg') {
        if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) return dataUrl;

        let offset = 2;
        while (offset < buffer.length) {
            const marker = buffer[offset + 1];
            if (marker === 0xE0) { // APP0
                // Check for JFIF
                if (buffer[offset + 4] === 0x4A &&
                    buffer[offset + 5] === 0x46 &&
                    buffer[offset + 6] === 0x49 &&
                    buffer[offset + 7] === 0x46 &&
                    buffer[offset + 8] === 0x00) {

                    buffer[offset + 11] = 1; // dots per inch
                    buffer[offset + 12] = (dpi >> 8) & 0xFF; // X high
                    buffer[offset + 13] = dpi & 0xFF;        // X low
                    buffer[offset + 14] = (dpi >> 8) & 0xFF; // Y high
                    buffer[offset + 15] = dpi & 0xFF;        // Y low
                    break;
                }
            }
            const len = (buffer[offset + 2] << 8) | buffer[offset + 3];
            offset += len + 2;
        }

        // Re-encode
        let binaryString = '';
        for (let i = 0; i < buffer.length; i += 32768) {
            binaryString += String.fromCharCode.apply(null, Array.from(buffer.subarray(i, i + 32768)));
        }
        return `data:image/${type};base64,${btoa(binaryString)}`;

    } else if (type === 'png') {
        // Robust PNG chunk parsing to replace existing pHYs or add new one
        const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
        // Simple check
        for (let i = 0; i < 8; i++) if (buffer[i] !== signature[i]) return dataUrl;

        const chunks: Uint8Array[] = [signature];
        let pos = 8;
        let hasAddedPhys = false;

        while (pos < buffer.length) {
            if (pos + 8 > buffer.length) break;

            const chunkLen = (buffer[pos] << 24) | (buffer[pos + 1] << 16) | (buffer[pos + 2] << 8) | buffer[pos + 3];
            const chunkType = String.fromCharCode(buffer[pos + 4], buffer[pos + 5], buffer[pos + 6], buffer[pos + 7]);

            const fullChunkLen = 12 + chunkLen; // Len(4) + Type(4) + Data(Len) + CRC(4)

            if (pos + fullChunkLen > buffer.length) break;

            const chunkData = buffer.slice(pos, pos + fullChunkLen);

            if (chunkType === 'IHDR') {
                chunks.push(chunkData);
                // Insert pHYs after IHDR
                chunks.push(createPhysChunk(dpi));
                hasAddedPhys = true;
            } else if (chunkType === 'pHYs') {
                // Skip existing pHYs chunk (we replaced it)
            } else if (chunkType === 'IEND') {
                chunks.push(chunkData);
                break;
            } else {
                chunks.push(chunkData);
            }

            pos += fullChunkLen;
        }

        // Calculate total length
        let totalLength = 0;
        for (const chunk of chunks) totalLength += chunk.length;

        const newBuffer = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            newBuffer.set(chunk, offset);
            offset += chunk.length;
        }

        let binaryString = '';
        for (let i = 0; i < newBuffer.length; i += 32768) {
            binaryString += String.fromCharCode.apply(null, Array.from(newBuffer.subarray(i, i + 32768)));
        }
        return `data:image/${type};base64,${btoa(binaryString)}`;
    }

    return dataUrl;
};

/**
 * Generates a CSS filter string for real-time previewing
 */
export const getCssFilterString = (filters?: FilterConfig): string => {
    if (!filters) return 'none';
    return `
        brightness(${filters.brightness}%) 
        contrast(${filters.contrast}%) 
        saturate(${filters.saturation}%) 
        grayscale(${filters.grayscale}%) 
        sepia(${filters.sepia}%) 
        blur(${filters.blur}px)
    `.trim();
};

/**
 * Simple LRU cache for processed images
 */
const IMAGE_CACHE_SIZE = 20;
const imageCache = new Map<string, string>();

const getCacheKey = (dataUrl: string, filters?: FilterConfig): string => {
    if (!filters) return dataUrl.substring(0, 100); // Short hash of original
    return `${dataUrl.substring(0, 50)}_${JSON.stringify(filters)}`;
};

const addToCache = (key: string, value: string) => {
    // Remove oldest entry if cache is full
    if (imageCache.size >= IMAGE_CACHE_SIZE) {
        const firstKey = imageCache.keys().next().value;
        if (firstKey) imageCache.delete(firstKey);
    }
    imageCache.set(key, value);
};

/**
 * Applies sharpening, color, and lighting filters to an image using Canvas.
 * Results are cached to avoid re-processing.
 */
export const processImage = (dataUrl: string, filters?: FilterConfig): Promise<string> => {
    return new Promise((resolve) => {
        // Check cache first
        const cacheKey = getCacheKey(dataUrl, filters);
        const cached = imageCache.get(cacheKey);
        if (cached) {
            resolve(cached);
            return;
        }

        if (!filters) {
            resolve(dataUrl);
            return;
        }

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(dataUrl);
                return;
            }

            // 1. Apply CSS-style Filters (GPU accelerated usually, very fast)
            ctx.filter = getCssFilterString(filters);
            ctx.drawImage(img, 0, 0);
            ctx.filter = 'none'; // Reset filter

            // 2. Apply Sharpening (Pixel Manipulation)
            if (filters.sharpening !== 'off') {
                let weights = [0, -1, 0, -1, 5, -1, 0, -1, 0]; // Default medium
                if (filters.sharpening === 'low') {
                    weights = [0, -0.5, 0, -0.5, 3, -0.5, 0, -0.5, 0];
                } else if (filters.sharpening === 'high') {
                    weights = [0, -1.5, 0, -1.5, 7, -1.5, 0, -1.5, 0];
                }

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const side = weights[1];
                const center = weights[4];

                const w = canvas.width;
                const h = canvas.height;
                const src = imageData.data;
                const output = ctx.createImageData(w, h);
                const dst = output.data;

                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const dstOff = (y * w + x) * 4;
                        dst[dstOff + 3] = src[dstOff + 3]; // Alpha copy

                        // Skip edges
                        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
                            dst[dstOff] = src[dstOff];
                            dst[dstOff + 1] = src[dstOff + 1];
                            dst[dstOff + 2] = src[dstOff + 2];
                            continue;
                        }

                        // RGB
                        for (let c = 0; c < 3; c++) {
                            const val =
                                src[dstOff - w * 4 + c] * side + // top
                                src[dstOff + w * 4 + c] * side + // bottom
                                src[dstOff - 4 + c] * side +   // left
                                src[dstOff + 4 + c] * side +   // right
                                src[dstOff + c] * center;      // center

                            dst[dstOff + c] = val < 0 ? 0 : val > 255 ? 255 : val;
                        }
                    }
                }
                ctx.putImageData(output, 0, 0);
            }

            // Export and cache result
            const mimeType = dataUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
            const result = canvas.toDataURL(mimeType);
            addToCache(cacheKey, result);
            resolve(result);
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
};

// Legacy support if needed, but redirects to processImage
export const applySharpening = (dataUrl: string, intensity: SharpeningLevel): Promise<string> => {
    return processImage(dataUrl, {
        brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0,
        sharpening: intensity
    });
};