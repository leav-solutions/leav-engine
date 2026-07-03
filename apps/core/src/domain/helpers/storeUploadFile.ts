import {logger} from '@leav/logger';
import fs from 'fs';

import {type FileUpload} from 'graphql-upload/Upload.mjs';
import progress, {type Progress} from 'progress-stream';

export type StoreUploadFileFunc = (
    fileData: FileUpload,
    path: string,
    onProgress?: (progress: Progress) => Promise<void>,
    size?: number,
) => Promise<void>;

export default function () {
    return async (
        fileData: FileUpload,
        path: string,
        onProgress?: (progress: Progress) => void,
        size?: number,
    ): Promise<void> => {
        const {createReadStream, filename} = fileData;
        const readStream = createReadStream();
        const storedFilePath = `${path}/${filename}`;

        const str = progress({
            length: size,
            time: 100 /* ms */,
        });

        await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(storedFilePath);

            if (typeof onProgress !== 'undefined') {
                str.on('progress', (p: Progress) => {
                    onProgress(p);
                });
            }

            writeStream.on('finish', () => resolve(undefined));

            writeStream.on('error', error => {
                logger.error(`Error while writing file because ${error.stack}`);

                fs.unlink(storedFilePath, () => {
                    reject(error);
                });
            });

            readStream.pipe(str).pipe(writeStream);
        });
    };
}
