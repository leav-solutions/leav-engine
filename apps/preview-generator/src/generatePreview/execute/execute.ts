// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {execFile} from 'child_process';
import {getArgs} from '../../getArgs/getArgs';
import {handleDocument} from '../../handleDocument/handleDocument';
import {ErrorPreview} from '../../types/ErrorPreview';
import {IConfig, IResult, IRootPaths, ISize, IVersion} from '../../types/types';
import {handleError} from '../../utils/log';

export interface IExecute {
    type: string;
    absInput: string;
    absOutput: string;
    version: IVersion;
    size: ISize;
    results: IResult[];
    rootPaths: IRootPaths;
    config: IConfig;
    first?: boolean;
}

export const execute = async ({
    rootPaths,
    absInput,
    absOutput,
    version,
    size,
    type,
    results,
    config,
    first = false
}: IExecute) => {
    if (type === 'document') {
        await handleDocument({
            input: absInput,
            output: absOutput,
            size: size.size,
            name: size.name,
            version,
            rootPaths,
            results
        });
    } else {
        const commands = await getArgs(type, absInput, absOutput, size.size, size.name, version, first);
        for (const commandAndArgs of commands) {
            if (commandAndArgs) {
                const {command, args} = commandAndArgs;

                const error = await new Promise(r =>
                    execFile(command, args, {}, e => {
                        r(e);
                    })
                );
                if (error) {
                    const errorId = handleError(error);

                    throw new ErrorPreview({
                        error: 501,
                        params: {
                            size: size.size,
                            output: size.output,
                            name: size.name,
                            background: version.background,
                            density: version.density,
                            errorId
                        }
                    });
                }
            }
        }
    }

    const outputWithoutRootPath = absOutput.replace(rootPaths.output, '');

    results.push({
        error: 0,
        params: {
            output: outputWithoutRootPath,
            size: size.size,
            name: size.name,
            density: version.density,
            background: version.background
        }
    });

    if (config.verbose) {
        console.info('output', size.output);
    }

    // After generating the first execution we generate a png reuse for other sizes, so the type is an image
    return 'image';
};
