// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {displayInitialState} from 'redux/display';
import {navigationInitialState} from 'redux/navigation';
import {infosInitialState} from 'redux/infos';
import {selectionInitialState} from 'redux/selection';
import {tasksInitialState} from 'redux/tasks';
import {notificationsInitialState} from 'redux/notifications';

export const mockInitialState = {
    display: displayInitialState,
    selection: selectionInitialState,
    navigation: navigationInitialState,
    info: infosInitialState,
    tasks: tasksInitialState,
    notifications: notificationsInitialState
};
