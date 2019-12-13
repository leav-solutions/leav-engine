import {extname} from 'path';
import {handleMultiPage} from './handleMultiPage/handleMultiPage';
import {unlinkSync} from 'fs';
import {execFileSync} from 'child_process';
import {IVersion} from './../types';
import {getImageArgs} from '../getArgs/getImageArgs/getImageArgs';

// convert document in tmp pdf, convert the pdf in png and delete the pdf
export const handleDocument = (input: string, output: string, size: number, version: IVersion, rootPath: string) => {
    const ext = extname(input)
        .toLowerCase()
        .replace('.', '');

    let tmpFile = input;
    if (ext !== 'pdf') {
        tmpFile = createDocumentTmpFile(input, output, size);
    }

    if (version.multiPage) {
        handleMultiPage(tmpFile, version.multiPage, rootPath);
    }

    const commands = getImageArgs('pdf', tmpFile, output, size, version, true);

    commands.forEach(commandAndArgs => {
        if (commandAndArgs) {
            const {command, args} = commandAndArgs;
            try {
                execFileSync(command, args, {stdio: 'pipe'});
            } catch (e) {
                throw {
                    error: 13,
                    params: {
                        size,
                        output,
                    },
                };
            }
        }
    });

    if (ext !== 'pdf') {
        unlinkSync(tmpFile);
    }
};

const createDocumentTmpFile = (input: string, output: string, size: number) => {
    const tmpOutput = `${output}.pdf`;

    const command = 'unoconv';
    const args = ['-f', 'pdf', '-o', tmpOutput, input];

    try {
        execFileSync(command, args, {stdio: 'pipe'});
    } catch (error) {
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
