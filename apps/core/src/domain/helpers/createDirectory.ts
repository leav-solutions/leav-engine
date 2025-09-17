// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import fs from 'fs';
import type * as Config from '_types/config';
import * as Path from 'path';
import {Errors} from '../../_types/errors';
import {type IUtils} from 'utils/utils';
import {type IQueryInfos} from '_types/queryInfos';

export type CreateDirectoryFunc = (name: string, path: string, ctx: IQueryInfos) => Promise<void>;

interface IDeps {
    config: Config.IConfig;
    'core.utils': IUtils;
}

export default function ({config, 'core.utils': utils}: IDeps) {
    return async (name: string, path: string, ctx: IQueryInfos): Promise<void> => {
        if (!fs.existsSync(path)) {
            throw utils.generateExplicitValidationError('directories', Errors.DUPLICATE_DIRECTORY_NAMES, ctx.lang);
        }

        await fs.promises.mkdir(Path.join(path, name));
    };
}
