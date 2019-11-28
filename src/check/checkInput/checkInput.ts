import * as fs from 'fs';

export const checkInput = (input: string) => {
    if (!fs.existsSync(input)) {
        throw [
            {
                error_code: 1,
                error: "file doesn't exit",
                params: null,
            },
        ];
    }

    try {
        const stats = fs.lstatSync(input);
        if (!stats.isFile()) {
            throw [
                {
                    error_code: 2,
                    error: 'input is not a file',
                    params: null,
                },
            ];
        }
    } catch (e) {
        throw [
            {
                error_code: 3,
                error: 'error when get file stats',
                params: null,
            },
        ];
    }
};
