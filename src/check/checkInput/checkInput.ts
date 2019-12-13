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
    let stats: fs.Stats;
    try {
        stats = fs.lstatSync(input);
    } catch (e) {
        throw [
            {
                error: 3,
                params: null,
            },
        ];
    }

    if (!stats.isFile()) {
        throw [
            {
                error: 2,
                params: null,
            },
        ];
    }
};
