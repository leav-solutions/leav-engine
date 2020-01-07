import {handleError} from './../../utils/log';
import {access} from 'fs';
import {ErrorPreview} from './../../types/ErrorPreview';
import {IConfig} from './../../types/types';

export const initialCheck = async (config: IConfig) => {
    // check input rootPath
    const errInputRootPathExist = await new Promise(res => access(config.inputRootPath, e => res(e)));

    if (errInputRootPathExist) {
        const errorId = handleError(errInputRootPathExist);

        throw new ErrorPreview({
            error: 101,
            params: {
                errorId,
            },
        });
    }

    // check output rootPath
    const errOutputRootPathExist = await new Promise(r =>
        access(config.outputRootPath, e => {
            r(e);
        }),
    );

    if (errOutputRootPathExist) {
        const errorId = handleError(errOutputRootPathExist);

        throw new ErrorPreview({
            error: 102,
            params: {
                errorId,
            },
        });
    }
};
