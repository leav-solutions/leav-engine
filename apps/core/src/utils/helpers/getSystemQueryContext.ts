// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {v4 as uuidv4} from 'uuid';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {adminsGroupId, filesAdminsGroupId, systemUserId} from '../../_constants/users';

interface IDeps {
    config?: IConfig;
}

export type GetSystemQueryContext = () => IQueryInfos;

// FIXME: System should not be a user in records and permissions should be bypassed with this system query context
// https://aristid.atlassian.net/browse/LEAVC-256

export default function ({config = null}: IDeps): GetSystemQueryContext {
    return () => ({
        userId: systemUserId,
        lang: config.lang.default,
        queryId: uuidv4(),
        groupsId: [adminsGroupId, filesAdminsGroupId],
        errors: []
    });
}
