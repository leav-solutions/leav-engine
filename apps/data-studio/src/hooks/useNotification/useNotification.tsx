// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {notification} from 'antd';
import {ArgsProps} from 'antd/es/notification/interface';

interface INotificationHook {
    triggerNotification: (args: ArgsProps) => void;
}

function useNotification(): INotificationHook {
    return {
        triggerNotification: (args: ArgsProps) => {
            notification.open(args);
        }
    };
}

export default useNotification;
