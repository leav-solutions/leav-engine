// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {exec} from 'child_process';

// Check if image has a clipping path
export const hasClippingPath = async (input: string): Promise<boolean> => {
    let clippingPath = true;
    const commandTestClip = `identify -clip "${input}"`;

    const error = await new Promise(r => exec(commandTestClip, e => r(e)));

    if (error) {
        clippingPath = false;
    }

    return clippingPath;
};
