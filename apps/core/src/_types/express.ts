import {type Request} from 'express';
import {type IQueryInfos} from './queryInfos';

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
