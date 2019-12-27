import {execFile} from 'child_process';
import {handleDocument} from './../handleDocument/handleDocument';
import {join} from 'path';
import {getArgs} from './../getArgs/getArgs';
import {IMessageConsume, IResult, ISize, IVersion, IConfig, IRootPaths} from './../types';

export const generatePreview = async (
    msgContent: IMessageConsume,
    type: string,
    config: IConfig,
): Promise<IResult[]> => {
    let currentType = type;

    const results: IResult[] = [];
    const {input, versions} = msgContent;

    const {inputRootPath, outputRootPath} = config;
    const rootPaths: IRootPaths = {input: inputRootPath, output: outputRootPath};

    for (const version of versions) {
        const versionMaxSize = version.sizes.reduce((prev, current) => (prev.size < current.size ? current : prev));

        const absInput = join(rootPaths.input, input);
        const absOutput = join(rootPaths.output, versionMaxSize.output);

        currentType = await _execute({
            type: currentType,
            absInput,
            absOutput,
            version,
            size: versionMaxSize,
            results,
            rootPaths,
            config,
            first: true,
        });
        const maxSizePath = versionMaxSize.output;

        const versionSizeRest = version.sizes.filter(v => v !== versionMaxSize);
        for (const size of versionSizeRest) {
            const absNewInput = join(rootPaths.output, maxSizePath);
            const absFinalOutput = join(rootPaths.output, size.output);

            await _execute({
                type: currentType,
                absInput: absNewInput,
                absOutput: absFinalOutput,
                version,
                size,
                results,
                rootPaths,
                config,
                first: false,
            });
        }
    }

    return results;
};

interface IExecute {
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

const _execute = async ({
    rootPaths,
    absInput,
    absOutput,
    version,
    size,
    type,
    results,
    config,
    first = false,
}: IExecute) => {
    if (type === 'document') {
        await handleDocument(absInput, absOutput, size.size, version, rootPaths);
    } else {
        const commands = await getArgs(type, absInput, absOutput, size.size, version, first);
        for (const commandAndArgs of commands) {
            if (commandAndArgs) {
                const {command, args} = commandAndArgs;

                const error = await new Promise(r =>
                    execFile(command, args, {}, e => {
                        r(e);
                    }),
                );
                if (error) {
                    throw {
                        error: 11,
                        params: {
                            size: size.size,
                            output: size.output,
                            background: version.background,
                            density: version.density,
                        },
                    };
                }
            }
        }
    }

    results.push({
        error: 0,
        params: {
            output: absOutput,
            size: size.size,
            density: version.density,
            background: version.background,
        },
    });

    if (config.verbose) {
        console.info(size.output);
    }

    // After generating the first execution we generate a png reuse for other sizes, so the type is an image
    return 'image';
};
