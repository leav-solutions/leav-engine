// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Request} from 'express';
import {v4 as uuidv4} from 'uuid';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';

interface IDeps {
    config?: IConfig;
}

export type InitQueryContextFunc = (req?: Request) => IQueryInfos;

export default function ({config = null}: IDeps): InitQueryContextFunc {
    return req => ({
        userId: null,
        lang: (req?.query.lang as string) ?? config.lang.default,
        queryId: req?.body.requestId || uuidv4(),
        groupsId: [],
        errors: []
    });
}
