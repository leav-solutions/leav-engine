// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IArgs} from '../../../types/types';
import {checkClippingPathJpg} from './checkClippingPathJpg/checkClippingPathJpg';

export const getJpgArgs = async (input: string): Promise<IArgs> => {
    const clippingPath = await checkClippingPathJpg(input);

    if (clippingPath) {
        return {
            before: [],
            after: [
                '-alpha',
                'transparent', // set the image transparent
                '-clip', // select the clipping path
                '-alpha',
                'opaque' // set the inside of the image opaque
            ]
        };
    } else {
        return {
            before: [],
            after: []
        };
    }
};
