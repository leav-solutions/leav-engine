import {ErrorPreview} from './../../types/ErrorPreview';
import {lstat, access} from 'fs';
import {join} from 'path';

export const checkInput = async (input: string, inputRootPath: string) => {
    const absInput = join(inputRootPath, input);

    const absInputExist = await new Promise(res => access(absInput, e => res(!e)));
    if (!absInputExist) {
        throw new ErrorPreview({
            error: 301,
        });
    }

    const [errorStats, stats] = await new Promise(res => lstat(absInput, (e, r) => res([e, r])));
    if (errorStats) {
        throw new ErrorPreview({
            error: 303,
        });
    }

    if (!stats.isFile()) {
        throw new ErrorPreview({
            error: 302,
        });
    }
};
