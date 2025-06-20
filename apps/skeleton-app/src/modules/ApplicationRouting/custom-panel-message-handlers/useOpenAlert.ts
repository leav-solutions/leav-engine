// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitAlert} from 'aristid-ds';
import {IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';

export const useOpenAlert = () => {
    const openAlert: IUseIFrameMessengerOptions['handlers']['onAlert'] = data => {
        KitAlert[data.type]?.({
            ...data
        });
    };

    return {
        openAlert
    };
};
