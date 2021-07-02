// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {exec} from 'child_process';

export const checkClippingPathJpg = async (input: string) => {
    let clippingPath = true;
    const commandTestClip = `identify -clip "${input}"`;

    const error = await new Promise(r => exec(commandTestClip, e => r(e)));

    if (error) {
        clippingPath = false;
    }

    return clippingPath;
};
