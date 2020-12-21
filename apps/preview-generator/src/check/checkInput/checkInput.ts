import {access, lstat} from 'fs';
import {join} from 'path';
import {ErrorPreview} from './../../types/ErrorPreview';
import {handleError} from './../../utils/log';

export const checkInput = async (input: string, inputRootPath: string) => {
    const absInput = join(inputRootPath, input);

    const errInputExist = await new Promise(res => access(absInput, e => res(e)));
    if (errInputExist) {
        const errorId = handleError(errInputExist);

        throw new ErrorPreview({
            error: 301,
            params: {
                errorId
            }
        });
    }

    const [errorStats, stats] = await new Promise(res => lstat(absInput, (e, r) => res([e, r])));
    if (errorStats) {
        const errorId = handleError(errorStats);
        throw new ErrorPreview({
            error: 303,
            params: {
                errorId
            }
        });
    }

    if (!stats.isFile()) {
        throw new ErrorPreview({
            error: 302
        });
    }
};
