// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IConfig} from '_types/config';

export const getRootPathByKey = (rootKey: string, config: IConfig) => {
    const rootPathConfig = config.files.rootPaths;

    // Paths config is in the form of: "key1:path1,key2:path2"
    const pathsByKeys = rootPathConfig.split(',').reduce((paths, pathByKey) => {
        // Trim all the thing to be tolerant with trailing spaces
        const [key, path] = pathByKey.trim().split(':');
        paths[key.trim()] = path.trim();

        return paths;
    }, {});

    if (!pathsByKeys[rootKey]) {
        throw new Error(`Root path for key ${rootKey} not found`);
    }

    return pathsByKeys[rootKey];
};
