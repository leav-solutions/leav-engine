import {IExec} from '../../../types';

export const handleBackground = (args: string[], background: boolean | string, output: string): IExec => {
    if (typeof background === 'string') {
        return {
            command: 'convert',
            args: [output, '-background', background, '-flatten', output],
        };
    } else if (background === true) {
        return {
            command: 'composite',
            args: ['-compose', 'Dst_Over', '-tile', 'pattern:checkerboard', output, output],
        };
    }
    return null;
};
