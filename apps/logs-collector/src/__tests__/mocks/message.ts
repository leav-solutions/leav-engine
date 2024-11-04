// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction, IDbEvent} from '@leav/utils';

export const mockMessage: IDbEvent = {
    instanceId: 'test',
    time: Date.now(),
    userId: 'test',
    queryId: 'test',
    emitter: 'test',
    payload: {
        trigger: 'test',
        action: EventAction.LIBRARY_SAVE,
        topic: {library: 'my_app'},
        before: 'test',
        after: 'test',
        metadata: 'test'
    }
};
