// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {execFile} from 'child_process';
import {unlink} from 'fs';
import {extname} from 'path';
import {ErrorPreview} from '../errors/ErrorPreview';
import {getImageArgs} from '../getArgs/getImageArgs/getImageArgs';
import {IResult, IRootPaths, IVersion} from '../types/types';
import {handleError} from './../utils/log';
import {handleMultiPage} from './handleMultiPage/handleMultiPage';

interface IHandleDocument {
    input: string;
    output: string;
    size: number;
    name: string;
    version: IVersion;
    rootPaths: IRootPaths;
    results: IResult[];
}

// convert document in tmp pdf, convert the pdf in png and delete the pdf
export const handleDocument = async ({input, output, size, name, version, rootPaths, results}: IHandleDocument) => {
    const ext = extname(input)
        .toLowerCase()
        .replace('.', '');

    const isPdfLike = ext === 'pdf' || ext === 'ai';

    let pdfFile = input;
    if (!isPdfLike) {
        pdfFile = await _createDocumentTmpFile(input, output, size, name);
    }

    if (version.multiPage) {
        await handleMultiPage(pdfFile, version.multiPage, rootPaths, results);
    }

    const commands = await getImageArgs('pdf', pdfFile, output, size, name, version, true);

    for (const commandAndArgs of commands) {
        if (commandAndArgs) {
            const {command, args} = commandAndArgs;
            const errorExec = await new Promise(r => execFile(command, args, {}, e => r(e)));

            if (errorExec) {
                const errorId = handleError(errorExec);

                throw new ErrorPreview({
                    error: 503,
                    params: {
                        size,
                        output,
                        name,
                        errorId
                    }
                });
            }
        }
    }

    if (!isPdfLike) {
        await new Promise(r => unlink(pdfFile, r));
    }
};

const _createDocumentTmpFile = async (input: string, output: string, size: number, name: string) => {
    const tmpOutput = `${output}.pdf`;

    const command = 'unoconv';
    const args = ['-f', 'pdf', '-o', tmpOutput, input];

    const error = await new Promise(r =>
        execFile(command, args, {}, e => {
            r(e);
        })
    );

    if (error) {
        const errorId = handleError(error);

        throw new ErrorPreview({
            error: 502,
            params: {
                output,
                size,
                name,
                errorId
            }
        });
    }

    return tmpOutput;
};
