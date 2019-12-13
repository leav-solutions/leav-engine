import {execFileSync} from 'child_process';
import {existsSync, mkdirSync} from 'fs';
import {join} from 'path';

export const handleMultiPage = (pdfFile: string, multiPage: string, rootPath: string) => {
    const folderDestinationPath = join(rootPath, multiPage);

    if (!existsSync(folderDestinationPath)) {
        try {
            mkdirSync(folderDestinationPath);
        } catch (e) {
            throw {
                error: 15,
            };
        }
    }

    let nbPage: number;
    try {
        nbPage = parseInt(
            execFileSync('gs', [
                '-q',
                '-dNODISPLAY', // only display the command result
                '-dBATCH', // quit ghostscript after the command
                '-c',
                `(${pdfFile}) (r) file runpdfbegin pdfpagecount = quit`,
            ]),
            10,
        );
    } catch (e) {
        throw {
            error: 16,
        };
    }

    const countDigit = (n: number) => {
        let count = 0;
        while (n !== 0) {
            n = Math.round(n / 10);
            count++;
        }

        return count;
    };

    const fullPath = join(folderDestinationPath, `%${'0' + countDigit(nbPage)}d.pdf`);

    try {
        execFileSync(
            'gs',
            [
                `-sOutputFile=${fullPath}`,
                '-sDEVICE=pdfwrite',
                '-dSAFER', // disable destructive operation
                '-dQUIET', // disable display
                '-dBATCH', // quit ghostscript after the command
                '-dNOPAUSE', // don't stop after each page
                pdfFile,
            ],
            {stdio: 'pipe'},
        );
    } catch (e) {
        throw {
            error: 17,
        };
    }
};
