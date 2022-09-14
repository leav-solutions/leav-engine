// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {exec, ExecException} from 'child_process';

export const hasTransparency = async (input: string): Promise<boolean> => {
    // Check if image is fully opaque: True if opaque, False if transparent
    const command = `identify -format "%[opaque]" "${input}"`;

    // execute command in a promise
    const [error, response] = (await new Promise(r => exec(command, (err, res) => r([err, res])))) as [
        ExecException,
        string
    ];

    if (error) {
        throw new Error(error.message);
    }

    return response !== 'True';
};
