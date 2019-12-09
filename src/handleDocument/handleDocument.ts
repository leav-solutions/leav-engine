import {unlinkSync} from 'fs';
import {execFileSync} from 'child_process';
import {getImageArgs} from '../getArgs/getImageArgs/getImageArgs';

// convert document in tmp pdf, convert the pdf in png and delete the pdf
export const handleDocument = (input: string, output: string, size: number) => {
    const tmpFile = createDocumentTmpFile(input, output, size);
    const version = {
        sizes: [{output: 'test.png', size}],
    };

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

    unlinkSync(tmpFile);
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
