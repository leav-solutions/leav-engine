import {access} from 'fs';
import {ErrorPreview} from './../../types/ErrorPreview';
import {IConfig} from './../../types/types';

export const initialCheck = async (config: IConfig) => {
    // check input rootPath
    const inputRootPathExist = await new Promise(res => access(config.inputRootPath, e => res(!e)));

    if (!inputRootPathExist) {
        throw new ErrorPreview({
            error: 101,
        });
    }

    // check output rootPath
    const outputRootPathExist = await new Promise(r =>
        access(config.outputRootPath, e => {
            r(!e);
        }),
    );

    if (!outputRootPathExist) {
        throw new ErrorPreview({
            error: 102,
        });
    }
};
