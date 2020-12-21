import crypto from 'crypto';
import fs from 'fs';

export const createHashFromFile = (filePath: string): Promise<string> =>
    new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5');
        fs.createReadStream(filePath)
            .on('data', data => hash.update(data))
            .on('end', () => resolve(hash.digest('hex')))
            .on('error', err => reject(err));
    });
