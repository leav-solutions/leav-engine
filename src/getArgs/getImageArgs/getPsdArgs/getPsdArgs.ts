import {IArgs} from './../../../types';
import {checkClippingPathPsd} from './checkClippingPathPsd/checkClippingPathPsd';

export const getPsdArgs = async (input: string): Promise<IArgs> => {
    const clippingPath = await checkClippingPathPsd(input);

    if (clippingPath) {
        return {
            before: [
                '-flatten', // flatten all layers
            ],
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
            before: [
                '-flatten', // flatten all layers
            ],
            after: [],
        };
    }
};
