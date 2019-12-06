import {handleDocument} from './../handleDocument/handleDocument';
import {join} from 'path';
import {execFileSync} from 'child_process';
import {getArgs} from './../getArgs/getArgs';
import {IMessageConsume, IResult, ISize, IVersion, IConfig} from './../types';

export const generatePreview = (msgContent: IMessageConsume, type: string, config: IConfig): IResult[] => {
    const results: IResult[] = [];
    const {input, versions} = msgContent;

    const rootPath = config.rootPath;

    versions.forEach(version => {
        const versionMaxSize = version.sizes.reduce((prev, current) => (prev.size < current.size ? current : prev));
        const useProfile = true;

        execute({type, relativeInput: input, version, size: versionMaxSize, results, rootPath, useProfile});
        const maxSizeLocation = versionMaxSize.output;

        const versionSizeRest = version.sizes.filter(v => v !== versionMaxSize);

        versionSizeRest.forEach(size =>
            execute({type, relativeInput: maxSizeLocation, version, size, results, rootPath}),
        );
    });

    return results;
};

interface IExecute {
    type: string;
    relativeInput: string;
    version: IVersion;
    size: ISize;
    results: IResult[];
    rootPath: string;
    useProfile?: boolean;
}

const execute = ({rootPath, relativeInput, version, size, type, results, useProfile = false}: IExecute) => {
    const absInput = join(rootPath, relativeInput);
    const absOutput = join(rootPath, size.output);

    if (type === 'document') {
        handleDocument(absInput, absOutput, size.size);
    } else {
        const commands = getArgs(type, absInput, absOutput, size.size, version, useProfile);
        commands.forEach(commandAndArgs => {
            if (commandAndArgs) {
                const {command, args} = commandAndArgs;
                try {
                    execFileSync(command, args);
                } catch (e) {
                    throw {
                        error: 11,
                    };
                }
            }
        });
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

    console.info(size.output);
};
