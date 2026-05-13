import {type IQueryInfos} from '../../_types/queryInfos';
import {adminsGroupId, filesAdminsGroupId, systemUserId} from '../../_constants/users';
import * as crypto from 'node:crypto';

export const mockCtx: IQueryInfos = {
    userId: '1',
    queryId: '123456',
    lang: 'fr',
    errors: [],
};

export const mockSystemQueryContext: IQueryInfos = {
    userId: systemUserId,
    lang: 'en',
    queryId: crypto.randomUUID(),
    groupsId: [adminsGroupId, filesAdminsGroupId],
    errors: [],
};
