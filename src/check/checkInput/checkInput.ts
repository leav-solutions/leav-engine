import * as fs from 'fs';

export const checkInput = (input: string) => {
    if (!fs.existsSync(input)) {
        throw [
            {
                error: 1,
                params: null,
            },
        ];
    }

    try {
        const stats = fs.lstatSync(input);
        if (!stats.isFile()) {
            throw [
                {
                    error: 2,
                    params: null,
                },
            ];
        }
    } catch (e) {
        throw [
            {
                error: 3,
                params: null,
            },
        ];
    }
};
