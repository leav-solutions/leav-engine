import {handleError} from './../utils/log';
import {ErrorPreview} from './../types/ErrorPreview';
import {execFile} from 'child_process';
import {extname} from 'path';
import {handleMultiPage} from './handleMultiPage/handleMultiPage';
import {unlink} from 'fs';
import {IVersion, IRootPaths} from '../types/types';
import {getImageArgs} from '../getArgs/getImageArgs/getImageArgs';

// convert document in tmp pdf, convert the pdf in png and delete the pdf
export const handleDocument = async (
    input: string,
    output: string,
    size: number,
    name: string,
    version: IVersion,
    rootPaths: IRootPaths,
) => {
    const ext = extname(input)
        .toLowerCase()
        .replace('.', '');

    let pdfFile = input;
    if (ext !== 'pdf') {
        pdfFile = await _createDocumentTmpFile(input, output, size, name);
    }

    if (version.multiPage) {
        await handleMultiPage(pdfFile, version.multiPage, rootPaths);
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
                        errorId,
                    },
                });
            }
        }
    }

    if (ext !== 'pdf') {
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
        }),
    );

    if (error) {
        const errorId = handleError(error);

        throw new ErrorPreview({
            error: 502,
            params: {
                output,
                size,
                name,
                errorId,
            },
        });
    }

    return tmpOutput;
};
