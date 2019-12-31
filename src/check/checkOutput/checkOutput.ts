import {extname, dirname, join} from 'path';
import {access, mkdir, existsSync} from 'fs';
import {IConfig} from './../../types';

export const checkOutput = async (output: string, size: number, config: IConfig) => {
    // check output rootPath
    const outputRootPathExist = await new Promise(r =>
        access(config.outputRootPath, e => {
            r(!e);
        }),
    );

    if (!outputRootPathExist) {
        throw {
            error: 8,
            params: {
                output,
                size,
            },
        };
    }

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
                    throw {
                        error: 9,
                        params: {
                            output,
                            size,
                        },
                    };
                }
            }
        }
    }

    // checkOutput
    const extOutput = extname(output)
        .toLowerCase()
        .replace('.', '');

    if (extOutput !== 'png') {
        throw {
            error: 4,
            params: {
                output,
                size,
            },
        };
    }
};
