// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import fs from 'fs';
import {nanoid} from 'nanoid';
import {IFileUpload} from '_types/import';

export type StoreUploadFileFunc = (fileData: IFileUpload, path: string) => Promise<void>;

export default function () {
    return async (fileData: IFileUpload, path: string): Promise<void> => {
        const {createReadStream, filename} = fileData;
        const readStream = createReadStream();
        const storedFilePath = `${path}/${filename}`;

        await new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(storedFilePath);

            writeStream.on('finish', resolve);

            writeStream.on('error', error => {
                console.debug('Error while writing file', error);

                fs.unlink(storedFilePath, () => {
                    reject(error);
                });
            });

            readStream.pipe(writeStream);
        });
    };
}
