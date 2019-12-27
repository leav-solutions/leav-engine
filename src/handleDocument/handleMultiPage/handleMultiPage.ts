import {execFile} from 'child_process';
import {access, mkdir} from 'fs';
import {join} from 'path';
import {IRootPaths} from '../../types';

export const handleMultiPage = async (pdfFile: string, multiPage: string, rootPaths: IRootPaths) => {
    const folderDestinationPath = join(rootPaths.output, multiPage);

    const pathExist = await new Promise(r =>
        access(folderDestinationPath, e => {
            r(!e);
        }),
    );

    if (!pathExist) {
        const createDir = await new Promise(resolve =>
            mkdir(folderDestinationPath, {recursive: true}, e => resolve(!e)),
        );
        if (!createDir) {
            throw {
                error: 15,
            };
        }
    }

    let nbPage: number;
    const {result: resultCountPage, error: errorCountPage} = await new Promise(resolve =>
        execFile(
            'gs',
            [
                '-q',
                '-dNODISPLAY', // only display the command result
                '-dBATCH', // quit ghostscript after the command
                '-c',
                `(${pdfFile}) (r) file runpdfbegin pdfpagecount = quit`,
            ],
            (err, stdout) => resolve({result: stdout, error: err}),
        ),
    );

    if (errorCountPage) {
        throw {
            error: 16,
        };
    }

    nbPage = parseInt(resultCountPage, 10);

    const countDigit = (n: number) => n.toString().length;

    const fullPath = join(folderDestinationPath, `%${'0' + countDigit(nbPage)}d.pdf`);

    const {error} = await new Promise(resolve =>
        execFile(
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
            err => resolve({error: err}),
        ),
    );
    if (error) {
        throw {
            error: 17,
        };
    }
};
