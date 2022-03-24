// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {execFile} from 'child_process';
import {access} from 'fs';
import {join} from 'path';
import {createDirectoryRecursively} from '../../check/checkOutput/checkOutput';
import {ErrorPreview} from '../../errors/ErrorPreview';
import {IResult, IRootPaths} from '../../types/types';
import {handleError} from './../../utils/log';

export const handleMultiPage = async (
    pdfFile: string,
    multiPage: string,
    rootPaths: IRootPaths,
    results: IResult[]
) => {
    const folderDestinationPath = join(rootPaths.output, multiPage);

    let nbDigit: number;
    try {
        await _createFolderRec(folderDestinationPath);

        nbDigit = await _countPage(pdfFile);
        nbDigit = nbDigit.toString().length;

        await _split(folderDestinationPath, nbDigit, pdfFile);
    } catch (e) {
        const {error, params} = e;
        const errorResult: IResult = {error, params};

        results.push(errorResult);
        return;
    }

    const result: IResult = {
        error: 0,
        params: {
            output: multiPage,
            name: 'pages'
        }
    };

    results.push(result);
};

const _createFolderRec = async (folderDestinationPath: string) => {
    const pathExist = await new Promise(r =>
        access(folderDestinationPath, e => {
            r(!e);
        })
    );

    if (!pathExist) {
        const pathList = folderDestinationPath.split('/');
        pathList.shift();
        const errorCreateDir = await createDirectoryRecursively(pathList, folderDestinationPath, 0);

        if (errorCreateDir) {
            const errorId = handleError(errorCreateDir);

            throw new ErrorPreview({
                error: 601,
                params: {
                    errorId
                }
            });
        }
    }
};

const _countPage = async (pdfFile: string) => {
    const {result: resultCountPage, error: errorCountPage} = await new Promise(resolve => {
        execFile(
            'gs',
            [
                '-q',
                '-dNODISPLAY', // only display the command result
                '-dBATCH', // quit ghostscript after the command
                '-c',
                `(${pdfFile}) (r) file runpdfbegin pdfpagecount = quit`
            ],
            (err, stdout) => resolve({result: stdout, error: err})
        );
    });

    if (errorCountPage) {
        const errorId = handleError(errorCountPage);

        throw new ErrorPreview({
            error: 602,
            params: {
                errorId
            }
        });
    }

    return resultCountPage;
};

const _split = async (folderDestinationPath: string, nbDigit: number, pdfFile: string) => {
    const fullPath = join(folderDestinationPath, `%${'0' + nbDigit}d.pdf`);

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
                pdfFile
            ],
            err => resolve({error: err})
        )
    );
    if (error) {
        const errorId = handleError(error);

        throw new ErrorPreview({
            error: 603,
            params: {
                errorId
            }
        });
    }
};
