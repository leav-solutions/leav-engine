import {KitNotification} from 'aristid-ds';
import {type IUsePanelMessengerOptions} from '_ui/hooks/usePanelMessenger/types';

export const useOpenNotification = () => {
    const openNotification: IUsePanelMessengerOptions['handlers']['onNotification'] = data => {
        KitNotification[data.type]?.({
            ...data,
        });
    };

    return {
        openNotification,
    };
};
