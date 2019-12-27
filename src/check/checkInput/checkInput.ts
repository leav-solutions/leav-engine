import {lstat, access} from 'fs';
import {join} from 'path';

export const checkInput = async (input: string, inputRootPath: string) => {
    // check input rootPath
    const inputRootPathExist = await new Promise(res => access(inputRootPath, e => res(!e)));
    if (!inputRootPathExist) {
        throw {
            error: 7,
        };
    }

    const absInput = join(inputRootPath, input);

    const absInputExist = await new Promise(res => access(absInput, e => res(!e)));
    if (!absInputExist) {
        throw {
            error: 1,
            params: null,
        };
    }

    const [errorStats, stats] = await new Promise(res => lstat(absInput, (e, r) => res([e, r])));
    if (errorStats) {
        throw {
            error: 3,
            params: null,
        };
    }

    if (!stats.isFile()) {
        throw {
            error: 2,
            params: null,
        };
    }
};
