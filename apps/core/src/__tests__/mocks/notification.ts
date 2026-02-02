// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type INotification} from '../../_types/notification';

export const mockNotification: MandatoryId<INotification> = {
    id: 'test_notification',
    date: 1234567890,
    recipientUserId: 'test_user_id',
    content: {
        level: 'success',
        title: 'Test Notification',
        message: 'This is a test notification message.',
    },
};
