// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitNotification} from 'aristid-ds';
import {type IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';

export const useOpenNotification = () => {
    const openNotification: IUseIFrameMessengerOptions['handlers']['onNotification'] = data => {
        KitNotification[data.type]?.({
            ...data,
        });
    };

    return {
        openNotification,
    };
};
