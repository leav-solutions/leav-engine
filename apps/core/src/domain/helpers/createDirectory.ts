// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {on} from 'events';
import fs from 'fs';
import {FileUpload} from 'graphql-upload';
import progress, {Progress} from 'progress-stream';
import * as Config from '_types/config';
import * as Path from 'path';
import {Errors} from '../../_types/errors';
import {IUtils} from 'utils/utils';
import {IQueryInfos} from '_types/queryInfos';

export type CreateDirectoryFunc = (name: string, path: string, ctx: IQueryInfos) => Promise<void>;

interface IDeps {
    config?: Config.IConfig;
    'core.utils'?: IUtils;
}

export default function ({config = null, 'core.utils': utils = null}: IDeps) {
    return async (name: string, path: string, ctx: IQueryInfos): Promise<void> => {
        if (!fs.existsSync(path)) {
            throw utils.generateExplicitValidationError('directories', Errors.DUPLICATE_DIRECTORY_NAMES, ctx.lang);
        }

        await fs.promises.mkdir(Path.join(path, name));
    };
}
