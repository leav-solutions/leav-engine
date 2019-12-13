import {IArgs} from './../../../types';
import {checkClippingPathJpg} from './checkClippingPathJpg/checkClippingPathJpg';

export const getJpgArgs = (input: string): IArgs => {
    const clippingPath = checkClippingPathJpg(input);

    if (clippingPath) {
        return {
            before: [],
            after: [
                '-alpha',
                'transparent', // set the image transparent
                '-clip', // select the clipping path
                '-alpha',
                'opaque', // set the inside of the image opaque
            ],
        };
    } else {
        return {
            before: [],
            after: [],
        };
    }
};
