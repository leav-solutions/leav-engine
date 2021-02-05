// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as rootPath from 'app-root-path';

export const appRootPath = (): string => {
    const path = process.env.APP_ROOT_PATH ?? rootPath.path;

    return path[path.length - 1] === '/' ? path.substr(0, path.length - 1) : path;
};
