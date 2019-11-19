import {checkClipJpg, checkClipPsd} from '../checkImage/checkImage';
import {execImage} from '../execImage/execImage';
import {ISize} from '../types';

export const checkTypeImage = (input: string, output: string, size: ISize, extInput: string) => {
    const imgArgs = [
        input, // input path
        '-resize', // use resize option
        `${size.width}x${size.height}>`, // resize value
        '-density', // use density option
        '200', // density value
        '-profile', // use profile option
        '/app/profile/EuroscaleCoated.icc', // profile value
        '-profile', // use profile option
        '/app/profile/srgb.icm', // profile value
        `png:${output}` // output path
    ];

    switch (extInput) {
        case 'psd':
            return checkClipPsd(input, output, imgArgs);
        case 'jpeg':
        case 'jpg':
            return checkClipJpg(input, output, imgArgs);
        default:
            return execImage(output, imgArgs);
    }
};
