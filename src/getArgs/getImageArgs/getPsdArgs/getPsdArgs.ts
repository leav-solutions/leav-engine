import {IArgs} from './../../../types';
import {checkClippingPathPsd} from './checkClippingPathPsd/checkClippingPathPsd';

export const getPsdArgs = (input: string): IArgs => {
    const clippingPath = checkClippingPathPsd(input);

    if (clippingPath) {
        return {
            before: ['-flatten'],
            after: ['-alpha', 'transparent', '-clip', '-alpha', 'opaque'],
        };
    } else {
        return {
            before: ['-flatten'],
            after: [],
        };
    }
};
