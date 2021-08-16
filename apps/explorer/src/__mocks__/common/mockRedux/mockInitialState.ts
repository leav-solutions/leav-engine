// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {displayInitialState} from 'redux/display';
import {navigationInitialState} from 'redux/navigation';
import {notificationsInitialState} from 'redux/notifications';
import {selectionInitialState} from 'redux/selection';

export const mockInitialState = {
    display: displayInitialState,
    selection: selectionInitialState,
    navigation: navigationInitialState,
    notification: notificationsInitialState
};
