// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import fs from 'fs';

export default (filepath: string): Promise<Buffer> => {
    const fileStream = fs.createReadStream(filepath);

    return ((): Promise<Buffer> =>
        new Promise((resolve, reject) => {
            const chunks = [];

            fileStream.on('data', chunk => chunks.push(chunk));
            fileStream.on('error', reject);
            fileStream.on('end', () => resolve(Buffer.concat(chunks)));
        }))();
};
