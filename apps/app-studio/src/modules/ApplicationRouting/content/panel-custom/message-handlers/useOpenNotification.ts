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
