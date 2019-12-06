import {unlinkSync} from 'fs';
import {execFileSync} from 'child_process';
import {getImageArgs} from '../getArgs/getImageArgs/getImageArgs';

// convert document in tmp pdf, convert the pdf in png and delete the pdf
export const handleDocument = (input: string, output: string, size: number) => {
    const tmpFile = createDocumentTmpFile(input, output);
    const version = {
        sizes: [{output: 'test.png', size}],
    };

    const commands = getImageArgs('pdf', tmpFile, output, size, version, true);

    try {
        commands.forEach(commandAndArgs => {
            if (commandAndArgs) {
                const {command, args} = commandAndArgs;
                execFileSync(command, args, {stdio: 'pipe'});
            }
        });
    } catch (e) {
        throw {
            error: 16,
            params: {
                output,
                size,
            },
        };
    }

    unlinkSync(tmpFile);
};

const createDocumentTmpFile = (input: string, output: string) => {
    const tmpOutput = `${output}.pdf`;

    const command = 'unoconv';
    const args = ['-f', 'pdf', '-o', tmpOutput, input];

    execFileSync(command, args, {stdio: 'pipe'});

    return tmpOutput;
};
