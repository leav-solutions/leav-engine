// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Request} from 'express';
import {IQueryInfos} from './queryInfos';

type Context = IQueryInfos & {appFolder?: string};

export interface IRequestWithContext<P = any> extends Request<P> {
    ctx: Context;
}

declare global {
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        interface Request {
            ctx: Context;
        }
    }
}
