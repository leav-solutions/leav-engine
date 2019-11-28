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

        versionSizeRest.forEach(size => {
            execute({type, relativeInput: maxSizeLocation, version, size, results, rootPath});
        });
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

    const {command, args} = getArgs(type, absInput, absOutput, size.size, useProfile);

    execFileSync(command, args);

    results.push({
        error: 0,
        params: {
            ...size,
            density: version.density,
            background: version.background,
        },
    });

    console.info(size.output);
};
