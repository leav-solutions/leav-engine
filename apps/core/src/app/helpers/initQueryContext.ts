// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Request} from 'express';
import {type IConfig} from '_types/config';
import {type IQueryInfos} from '_types/queryInfos';
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
