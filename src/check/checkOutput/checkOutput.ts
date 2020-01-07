import {handleError} from './../../utils/log';
import {ISize} from './../../types/types';
import {ErrorPreview} from './../../types/ErrorPreview';
import {extname, dirname, join} from 'path';
import {access, mkdir, existsSync} from 'fs';
import {IConfig} from '../../types/types';

export const checkOutput = async (output: string, size: number, name: string, config: IConfig) => {
    // check if folder exist and create it if not
    const dirOutput = dirname(output);

    const pathExist = await new Promise(r =>
        access(dirOutput, e => {
            r(!e);
        }),
    );
    if (!pathExist) {
        const pathList = dirOutput.split('/');
        pathList.shift();
        let allPath = '/';

        for (const path of pathList) {
            allPath = join(allPath, path);
            const folderExist = await new Promise(r =>
                access(allPath, e => {
                    r(!e);
                }),
            );
            if (!folderExist) {
                const errDirCreated: NodeJS.ErrnoException = await new Promise(r =>
                    mkdir(allPath, e => {
                        r(e);
                    }),
                );
                // ignore error -17: folder already exists
                if (errDirCreated && errDirCreated.errno !== -17) {
                    const errorId = handleError(errDirCreated);

                    throw new ErrorPreview({
                        error: 401,
                        params: {
                            output,
                            size,
                            name,
                            errorId,
                        },
                    });
                }
            }
        }
    }

    // checkOutput
    const extOutput = extname(output)
        .toLowerCase()
        .replace('.', '');

    if (extOutput !== 'png') {
        throw new ErrorPreview({
            error: 402,
            params: {
                output,
                size,
                name,
            },
        });
    }
};
