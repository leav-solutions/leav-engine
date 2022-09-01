// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FileType} from '@leav/utils';
import {join} from 'path';
import {IConfig, IResult, IRootPaths, IVersion} from '../../types/types';
import {execute} from './../execute/execute';

export interface IHandleVersion {
    version: IVersion;
    rootPaths: IRootPaths;
    input: string;
    type: string;
    config: IConfig;
}

export const handleVersion = async ({version, rootPaths, input, type, config}: IHandleVersion) => {
    const results: IResult[] = [];
    let currentType = type;

    if (type === FileType.OTHER) {
        for (const size of version.sizes) {
            results.push({
                error: 0,
                error_detail: 'Not applicable',
                params: {
                    ...version,
                    name: size.name,
                    output: null
                }
            });
        }

        return results;
    }

    const versionMaxSize = version.sizes.reduce((prev, current) => (prev.size < current.size ? current : prev));

    const absInput = join(rootPaths.input, input);
    const absOutput = join(rootPaths.output, versionMaxSize.output);

    currentType = await execute({
        type: currentType,
        absInput,
        absOutput,
        version,
        size: versionMaxSize,
        results,
        rootPaths,
        config,
        first: true
    });

    const maxSizePath = versionMaxSize.output;

    const versionSizeRest = version.sizes.filter(v => v !== versionMaxSize);

    for (const size of versionSizeRest) {
        const absNewInput = join(rootPaths.output, maxSizePath);
        const absFinalOutput = join(rootPaths.output, size.output);

        const resizes = [];

        resizes.push(
            execute({
                type: currentType,
                absInput: absNewInput,
                absOutput: absFinalOutput,
                version,
                size,
                results,
                rootPaths,
                config,
                first: false
            })
        );

        await Promise.all(resizes);
    }
    return results;
};
