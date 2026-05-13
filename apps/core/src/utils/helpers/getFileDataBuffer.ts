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
