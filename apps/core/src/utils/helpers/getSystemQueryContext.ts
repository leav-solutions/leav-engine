// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {v4 as uuidv4} from 'uuid';
import {type IConfig} from '_types/config';
import {type IQueryInfos} from '_types/queryInfos';
import {systemUserId} from '../../_constants/users';

interface IDeps {
    config?: IConfig;
}

export type GetSystemQueryContext = (trigger?: string) => IQueryInfos;

// FIXME: System should not be a user in records and permissions should be bypassed with this system query context
// https://aristid.atlassian.net/browse/LEAVC-256

export default function ({config = null}: IDeps): GetSystemQueryContext {
    return (trigger?: string) => ({
        userId: systemUserId,
        lang: config.lang.default,
        queryId: uuidv4(),
        groupsId: [],
        errors: [],
        trigger,
    });
}
