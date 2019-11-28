import {IExec} from './../../types';

export const getVideoArgs = (input: string, output: string, size: number): IExec => {
    const command = 'ffmpeg';
    const args = ['-y', '-i', input, '-vf', 'thumbnail,scale=' + size + ':' + size, '-frames:v', '1', `png:${output}`];

    return {
        command,
        args,
    };
};
