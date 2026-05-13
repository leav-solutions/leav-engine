import {type IExec} from '../../../types/types';

export const handleBackground = (background: boolean | string, output: string): IExec => {
    if (typeof background === 'string') {
        return {
            command: 'magick',
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
