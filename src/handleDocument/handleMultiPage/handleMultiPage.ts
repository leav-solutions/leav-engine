import {handleError} from './../../utils/log';
import {ErrorPreview} from './../../types/ErrorPreview';
import {execFile} from 'child_process';
import {access, mkdir, existsSync} from 'fs';
import {join, dirname} from 'path';
import {IRootPaths} from '../../types/types';

export const handleMultiPage = async (pdfFile: string, multiPage: string, rootPaths: IRootPaths) => {
    const folderDestinationPath = join(rootPaths.output, multiPage);

    const pathExist = await new Promise(r =>
        access(folderDestinationPath, e => {
            r(!e);
        }),
    );

    if (!pathExist) {
        const errorCreateDir = await new Promise(r => mkdir(folderDestinationPath, async e => r(e)));
        if (errorCreateDir) {
            const errorId = handleError(errorCreateDir);

            throw new ErrorPreview({
                error: 601,
                params: {
                    errorId,
                },
            });
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
        const errorId = handleError(errorCountPage);

        throw new ErrorPreview({
            error: 602,
            params: {
                errorId,
            },
        });
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
        const errorId = handleError(error);

        throw new ErrorPreview({
            error: 603,
            params: {
                errorId,
            },
        });
    }
};
