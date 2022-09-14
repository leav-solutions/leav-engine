// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {exec, ExecException} from 'child_process';
import {Colorspaces} from '../../../types/constants';

export const getColorspace = async (input: string): Promise<Colorspaces> => {
    const command = `identify -format "%r" "${input}"`;
    const [error, response] = (await new Promise(r => exec(command, (err, res) => r([err, res])))) as [
        ExecException,
        string
    ];

    if (error) {
        throw new Error(error.message);
    }

    return response.indexOf('CMYK') > -1 ? Colorspaces.CMYK : Colorspaces.RGB;
};
