// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {infosInitialState} from 'reduxStore/infos';
import {navigationInitialState} from 'reduxStore/navigation';
import {notificationsInitialState} from 'reduxStore/notifications';
import {selectionInitialState} from 'reduxStore/selection';
import {tasksInitialState} from 'reduxStore/tasks';

export const mockInitialState = {
    selection: selectionInitialState,
    navigation: navigationInitialState,
    info: infosInitialState,
    tasks: tasksInitialState,
    notifications: notificationsInitialState
};
