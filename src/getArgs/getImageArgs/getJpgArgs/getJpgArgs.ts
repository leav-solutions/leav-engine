import {IArgs} from './../../../types';
import {checkClippingPathJpg} from './checkClippingPathJpg/checkClippingPathJpg';

export const getJpgArgs = (input: string): IArgs => {
    const clippingPath = checkClippingPathJpg(input);

    if (clippingPath) {
        return {
            before: [],
            after: ['-alpha', 'transparent', '-clip', '-alpha', 'opaque'],
        };
    } else {
        return {
            before: [],
            after: [],
        };
    }
};
