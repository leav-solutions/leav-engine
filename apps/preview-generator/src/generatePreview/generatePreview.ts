// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IConfig, IMessageConsume, IResult, IRootPaths} from '../types/types';
import {handleVersion} from './handleVersion/handleVersion';

export const generatePreview = async (
    msgContent: IMessageConsume,
    type: string,
    config: IConfig
): Promise<IResult[]> => {
    const {input, versions} = msgContent;

    const {inputRootPath, outputRootPath} = config;
    const rootPaths: IRootPaths = {input: inputRootPath, output: outputRootPath};

    const handleVersions = [];

    for (const version of versions) {
        handleVersions.push(handleVersion({version, rootPaths, input, type, config}));
    }

    const allResults = await Promise.all(handleVersions);

    // Merge all results
    return allResults.flat();
};
