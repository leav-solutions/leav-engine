import {infosInitialState} from '../../../reduxStore/infos';
import {navigationInitialState} from '../../../reduxStore/navigation';
import {notificationsInitialState} from '../../../reduxStore/notifications';
import {selectionInitialState} from '../../../reduxStore/selection';
import {tasksInitialState} from '../../../reduxStore/tasks';

export const mockInitialState = {
    selection: selectionInitialState,
    navigation: navigationInitialState,
    info: infosInitialState,
    tasks: tasksInitialState,
    notifications: notificationsInitialState,
};
