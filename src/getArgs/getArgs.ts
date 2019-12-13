import {extname} from 'path';
import {IExec, IVersion} from './../types';
import {getVideoArgs} from './getVideoArgs/getVideoArgs';
import {getImageArgs} from './getImageArgs/getImageArgs';

export const getArgs = (
    type: string,
    input: string,
    output: string,
    size: number,
    version: IVersion,
    useProfile = false,
): IExec[] => {
    const ext = extname(input)
        .toLowerCase()
        .replace('.', '');

    switch (type) {
        case 'video':
            return getVideoArgs(input, output, size);
        case 'image':
            return getImageArgs(ext, input, output, size, version, useProfile);
        case 'other':
            throw {
                error: 5,
                params: {
                    output,
                    size,
                },
            };
    }
};
