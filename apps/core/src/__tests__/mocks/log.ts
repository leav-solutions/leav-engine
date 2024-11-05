// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {EventAction, Log} from '@leav/utils';

export const mockLog: Log = {
    action: EventAction.VALUE_SAVE,
    instanceId: 'instanceId',
    queryId: '12345678-1234-1234-1234-123456789012',
    time: 123456789,
    userId: '1',
    topic: {
        library: 'my_lib',
        attribute: 'my_attribute',
        record: {
            id: '123456',
            libraryId: 'my_lib'
        }
    },
    before: 'value before',
    after: 'value after'
};
