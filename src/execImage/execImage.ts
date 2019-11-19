import * as child_process from 'child_process';
import {IResponse} from './../types';
import {errorToString} from '../utils';

export const execImageWithClip = (output: string, imgArgs: string[]): IResponse => {
    try {
        const clippingPathArgs = ['-alpha', 'transparent', '-clip', '-alpha', 'opaque'];

        imgArgs.splice(-1, 0, ...clippingPathArgs);

        child_process.execFileSync('convert', imgArgs);
        return {
            error_code: 0,
            error: null,
            output
        };
    } catch (e) {
        return {
            error_code: 12,
            error: errorToString(e),
            output: null
        };
    }
};

export const execImage = (output: string, imgArgs: string[]): IResponse => {
    try {
        child_process.execFileSync('convert', imgArgs);
        return {
            error_code: 0,
            error: null,
            output
        };
    } catch (e) {
        return {
            error_code: 11,
            error: errorToString(e),
            output: null
        };
    }
};
