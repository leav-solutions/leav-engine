import * as fs from 'fs';
import * as path from 'path';
import {ISize, IResponse} from './types';
import {checkInputOutput} from './checkInputOutput/checkInputOutput';

export const bench = (jsonFile: string, dest: string) => {
    const data: string = fs.readFileSync(jsonFile, 'utf8');
    const files: string[] = JSON.parse(data);

    const begin = Date.now();

    for (const file of files) {
        const output = path.join(dest, path.basename(file) + '.png');
        checkFile(file, output, [{width: 800, height: 800}]);
    }
    console.info((Date.now() - begin) / 1000);
};

export const checkFile = (input: string, output: string, sizes: ISize[]): IResponse[] => {
    if (!fs.existsSync(input)) {
        return [
            {
                error_code: 1,
                error: "file doesn't exit",
                output: null
            }
        ];
    }

    try {
        const stats = fs.lstatSync(input);

        if (!stats.isFile()) {
            return [
                {
                    error_code: 2,
                    error: 'input is not a file',
                    output: null
                }
            ];
        }
    } catch (e) {
        return [
            {
                error_code: 3,
                error: 'error when get file stats',
                output: null
            }
        ];
    }

    const infos = sizes.map(size => {
        return checkInputOutput(input, output, size);
    });

    return infos;
};
