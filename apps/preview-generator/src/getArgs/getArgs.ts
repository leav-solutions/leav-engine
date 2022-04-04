// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {extname} from 'path';
import {ErrorPreview} from '../errors/ErrorPreview';
import {IExec, IVersion} from '../types/types';
import {getImageArgs} from './getImageArgs/getImageArgs';
import {getVideoArgs} from './getVideoArgs/getVideoArgs';

export const getArgs = async (
    type: string,
    input: string,
    output: string,
    size: number,
    name: string,
    version: IVersion,
    first = false
): Promise<IExec[]> => {
    const ext = extname(input)
        .toLowerCase()
        .replace('.', '');

    switch (type) {
        case 'video':
            return getVideoArgs(input, output, size);
        case 'image':
            return getImageArgs(ext, input, output, size, name, version, first);
        default:
            throw new ErrorPreview({
                error: 304,
                params: {
                    output,
                    size,
                    name
                }
            });
    }
};
