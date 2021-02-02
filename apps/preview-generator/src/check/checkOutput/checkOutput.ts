// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {access, mkdir} from 'fs';
import {dirname, extname, join} from 'path';
import {IConfig} from '../../types/types';
import {handleError} from '../../utils/log';
import {ErrorPreview} from './../../types/ErrorPreview';

export const checkOutput = async (output: string, size: number, name: string, config: IConfig) => {
    // check if folder exist and create it if not
    const dirOutput = dirname(output);

    const pathExist = await new Promise(r =>
        access(dirOutput, e => {
            r(!e);
        })
    );
    if (!pathExist) {
        const pathList = dirOutput.split('/');
        pathList.shift();
        const errorCreateDir = await createDirectoryRecursively(pathList, output, size);

        if (errorCreateDir) {
            const errorId = handleError(errorCreateDir);

            throw new ErrorPreview({
                error: 401,
                params: {
                    output,
                    size,
                    name,
                    errorId
                }
            });
        }
    }

    // checkOutput
    const extOutput = extname(output).toLowerCase().replace('.', '');

    if (extOutput !== 'png') {
        throw new ErrorPreview({
            error: 402,
            params: {
                output,
                size,
                name
            }
        });
    }
};

export const createDirectoryRecursively = async (pathList: string[], output: string, size: number) => {
    let allPath = '/';

    for (const path of pathList) {
        allPath = join(allPath, path);
        const folderExist = await new Promise(r => access(allPath, e => r(!e)));

        if (!folderExist) {
            const errDirCreated: NodeJS.ErrnoException = await new Promise(r =>
                mkdir(allPath, e => {
                    r(e);
                })
            );

            // ignore error -17: folder already exists
            if (errDirCreated && errDirCreated.errno !== -17) {
                return errDirCreated;
            }
        }
    }
};
