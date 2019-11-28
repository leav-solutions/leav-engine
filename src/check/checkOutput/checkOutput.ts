import * as path from 'path';

export const checkOutput = (output: string, size: number) => {
    const extOutput = path
        .extname(output)
        .toLowerCase()
        .replace('.', '');

    if (extOutput !== 'png') {
        throw {
            error_code: 4,
            error: 'file output must be a png',
            params: {
                output,
                size,
            },
        };
    }
};
