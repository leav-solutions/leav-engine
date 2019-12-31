import {execFile} from 'child_process';
import {extname} from 'path';
import {handleMultiPage} from './handleMultiPage/handleMultiPage';
import {unlink} from 'fs';
import {IVersion, IRootPaths} from './../types';
import {getImageArgs} from '../getArgs/getImageArgs/getImageArgs';

// convert document in tmp pdf, convert the pdf in png and delete the pdf
export const handleDocument = async (
    input: string,
    output: string,
    size: number,
    version: IVersion,
    rootPaths: IRootPaths,
) => {
    const ext = extname(input)
        .toLowerCase()
        .replace('.', '');

    let pdfFile = input;
    if (ext !== 'pdf') {
        pdfFile = await _createDocumentTmpFile(input, output, size);
    }

    if (version.multiPage) {
        await handleMultiPage(pdfFile, version.multiPage, rootPaths);
    }

    const commands = await getImageArgs('pdf', pdfFile, output, size, version, true);

    for (const commandAndArgs of commands) {
        if (commandAndArgs) {
            const {command, args} = commandAndArgs;
            const errorExec = await new Promise(r => execFile(command, args, {}, e => r(e)));
            if (errorExec) {
                throw {
                    error: 13,
                    params: {
                        size,
                        output,
                    },
                };
            }
        }
    }

    if (ext !== 'pdf') {
        await new Promise(r => unlink(pdfFile, r));
    }
};

const _createDocumentTmpFile = async (input: string, output: string, size: number) => {
    const tmpOutput = `${output}.pdf`;

    const command = 'unoconv';
    const args = ['-f', 'pdf', '-o', tmpOutput, input];

    const error = await new Promise(r =>
        execFile(command, args, {}, e => {
            r(e);
        }),
    );

    if (error) {
        throw {
            error: 12,
            params: {
                output,
                size,
            },
        };
    }

    return tmpOutput;
};
