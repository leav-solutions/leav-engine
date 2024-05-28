const crypto = require('crypto');

const toBase64 = (hash: any): string => {
    const buf = Buffer.from(hash, 'base64');
    return buf.toString('base64');
};

export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hashed = await crypto.subtle.digest('SHA-256', data);
    return toBase64(hashed)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};
