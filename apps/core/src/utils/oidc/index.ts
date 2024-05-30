// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import crypto from 'crypto';

export const generateCodeChallenge = (codeVerifier: string) =>
    crypto.createHash('sha256').update(codeVerifier).digest('base64url');
