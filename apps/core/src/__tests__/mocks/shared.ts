// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IQueryInfos} from '_types/queryInfos';
import {adminsGroupId, filesAdminsGroupId, systemUserId} from '../../_constants/users';
import {v4 as uuidv4} from 'uuid';

export const mockCtx: IQueryInfos = {
    userId: '1',
    queryId: '123456',
    lang: 'fr',
    errors: []
};

export const mockSystemQueryContext: IQueryInfos = {
    userId: systemUserId,
    lang: 'en',
    queryId: uuidv4(),
    groupsId: [adminsGroupId, filesAdminsGroupId],
    errors: []
};
