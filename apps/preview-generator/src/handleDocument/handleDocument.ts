// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {execFile} from 'child_process';
import fs from 'fs/promises';
import {extname, join} from 'path';
import {ErrorPreview} from '../errors/ErrorPreview';
import {getImageArgs} from '../getArgs/getImageArgs/getImageArgs';
import {IResult, IRootPaths, IVersion} from '../types/types';
import {handleError} from './../utils/log';

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
    const ext = extname(input).toLowerCase().replace('.', '');

    const isPdfLike = ext === 'pdf' || ext === 'ai';

    let pdfFile;
    const pdfOutput = join(rootPaths.output, version.pdf);
    if (!isPdfLike) {
        pdfFile = await _createDocumentPdf(input, pdfOutput, size, name);
    } else {
        pdfFile = input;

        // Copy PDF file to the results folder.
        // First, create destination folder if it does not exist and then copy the file.
        const dirName = pdfOutput.split('/').slice(0, -1).join('/');
        await fs.mkdir(dirName, {recursive: true});
        await fs.copyFile(input, pdfOutput);
    }

    const result: IResult = {
        error: 0,
        params: {
            output: pdfOutput.replace(rootPaths.output, ''),
            name: 'pdf'
        }
    };

    results.push(result);

    // TODO: how results work?? refactor documents handling?
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
};

const _createDocumentPdf = async (input: string, output: string, size: number, name: string) => {
    const command = 'unoconv';
    const args = ['-f', 'pdf', '-o', output, input];

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

    return output;
};
