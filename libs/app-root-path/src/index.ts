// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import * as rootPath from 'app-root-path';
import path from 'path';

export const appRootPath = (): string => {
    return path.resolve(process.env.APP_ROOT_PATH ?? rootPath.path);
};
