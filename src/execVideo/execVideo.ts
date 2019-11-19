import * as child_process from 'child_process';
import {ISize} from '../types';
import {errorToString} from './../utils';
import {IResponse} from './../types';

export const execVideo = (input: string, output: string, size: ISize): IResponse => {
    try {
        const ffmpegArgs = [
            '-y',
            '-i',
            input,
            '-vf',
            'thumbnail,scale=' + size.width + ':' + size.height,
            '-frames:v',
            '1',
            `png:${output}`
        ];

        child_process.execFileSync('ffmpeg', ffmpegArgs);

        return {
            error_code: 0,
            error: null,
            output
        };
    } catch (e) {
        return {
            error_code: 15,
            error: errorToString(e),
            output: null
        };
    }
};
