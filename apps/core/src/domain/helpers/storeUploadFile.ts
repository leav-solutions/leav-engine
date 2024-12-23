// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import fs from 'fs';
import {FileUpload} from 'graphql-upload';
import progress, {Progress} from 'progress-stream';

export type StoreUploadFileFunc = (
    fileData: FileUpload,
    path: string,
    onProgress?: (progress: Progress) => Promise<void>,
    size?: number
) => Promise<void>;

export default function () {
    return async (
        fileData: FileUpload,
        path: string,
        onProgress?: (progress: Progress) => void,
        size?: number
    ): Promise<void> => {
        const {createReadStream, filename} = fileData;
        const readStream = createReadStream();
        const storedFilePath = `${path}/${filename}`;

        const str = progress({
            length: size,
            time: 100 /* ms */
        });

        await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(storedFilePath);

            if (typeof onProgress !== 'undefined') {
                str.on('progress', (p: Progress) => {
                    onProgress(p);
                });
            }

            writeStream.on('finish', resolve);

            writeStream.on('error', error => {
                console.error('Error while writing file', error);

                fs.unlink(storedFilePath, () => {
                    reject(error);
                });
            });

            readStream.pipe(str).pipe(writeStream);
        });
    };
}
