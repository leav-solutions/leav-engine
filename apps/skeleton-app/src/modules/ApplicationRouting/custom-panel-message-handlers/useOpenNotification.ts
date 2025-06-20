// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useKitNotification} from 'aristid-ds';
import {IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';

export const useOpenNotification = () => {
    const {kitNotification} = useKitNotification();

    const openNotification: IUseIFrameMessengerOptions['handlers']['onNotification'] = data => {
        kitNotification.open({
            ...data
        });
    };

    return {
        openNotification
    };
};
