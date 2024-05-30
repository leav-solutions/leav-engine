// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import crypto from 'crypto';

export const generateCodeChallenge = (codeVerifier: string) => {
    const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64');
    // Convert base64 to base64url
    return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
