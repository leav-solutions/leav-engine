import * as child_process from 'child_process';
import {errorToString} from '../utils';

export const execPsdWithClip = (output: string, imgArgs: string[]) => {
    try {
        const psdArgs = ['-alpha', 'transparent', '-clip', '-alpha', 'opaque'];

        imgArgs.splice(1, 0, '-flatten');
        imgArgs.splice(-1, 0, ...psdArgs);

        child_process.execFileSync('convert', imgArgs);

        return {
            error_code: 0,
            error: null,
            output
        };
    } catch (e) {
        return {
            error_code: 14,
            error: errorToString(e),
            output: null
        };
    }
};

export const execPsd = (output: string, imgArgs: string[]) => {
    try {
        const psdArgs = ['-flatten'];

        imgArgs.splice(1, 0, ...psdArgs);

        child_process.execFileSync('convert', imgArgs);

        return {
            error_code: 0,
            error: null,
            output
        };
    } catch (e) {
        return {
            error_code: 13,
            error: errorToString(e),
            output: null
        };
    }
};
