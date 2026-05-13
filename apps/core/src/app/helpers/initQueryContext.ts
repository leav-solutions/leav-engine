import {type Request} from 'express';
import {type IConfig} from '../../_types/config';
import {type IQueryInfos} from '../../_types/queryInfos';
import * as crypto from 'node:crypto';

interface IDeps {
    config?: IConfig;
}

export type InitQueryContextFunc = (req?: Request) => IQueryInfos;

export default function ({config = null}: IDeps): InitQueryContextFunc {
    return req => ({
        userId: null,
        lang: (req?.query.lang as string) ?? config.lang.default,
        queryId: req?.body.requestId || crypto.randomUUID(),
        groupsId: [],
        errors: [],
    });
}
