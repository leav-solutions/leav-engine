import {KitAlert} from 'aristid-ds';
import {type IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';

export const useOpenAlert = () => {
    const openAlert: IUseIFrameMessengerOptions['handlers']['onAlert'] = data => {
        KitAlert[data.type]?.({
            ...data,
        });
    };

    return {
        openAlert,
    };
};
