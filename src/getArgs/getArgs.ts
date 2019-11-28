import {IExec} from './../types';
import {extname} from 'path';
import {getVideoArgs} from './getVideoArgs/getVideoArgs';
import {getImageArgs} from './getImageArgs/getImageArgs';

export const getArgs = (type: string, input: string, output: string, size: number, useProfile = false): IExec => {
    const ext = extname(input)
        .toLowerCase()
        .replace('.', '');

    switch (type) {
        case 'video':
            return getVideoArgs(input, output, size);
        case 'image':
            return getImageArgs(ext, input, output, size, useProfile);
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
