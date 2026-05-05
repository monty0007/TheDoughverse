const IMAGE_SIGNATURES = {
    'image/jpeg': {
        extension: '.jpg',
        matches: (buffer: Buffer) => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
    },
    'image/png': {
        extension: '.png',
        matches: (buffer: Buffer) => buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    },
    'image/webp': {
        extension: '.webp',
        matches: (buffer: Buffer) => buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP',
    },
} as const;

type AllowedMimeType = keyof typeof IMAGE_SIGNATURES;

function detectImageMimeType(buffer: Buffer): AllowedMimeType | null {
    const match = Object.entries(IMAGE_SIGNATURES).find(([, signature]) => signature.matches(buffer));
    return match?.[0] as AllowedMimeType | null;
}

function safeBaseName(originalName: string) {
    return originalName
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'image';
}

export function validateUploadedImage(file: { buffer: Buffer; mimetype: string; originalname: string }) {
    const detectedMimeType = detectImageMimeType(file.buffer);

    if (!detectedMimeType || detectedMimeType !== file.mimetype) {
        throw new Error('Unsupported or invalid image file');
    }

    const extension = IMAGE_SIGNATURES[detectedMimeType].extension;
    return {
        mimeType: detectedMimeType,
        fileName: `${safeBaseName(file.originalname)}${extension}`,
    };
}