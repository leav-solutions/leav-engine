import {KitAlert} from 'aristid-ds';
import {type IUsePanelMessengerOptions} from '_ui/hooks/usePanelMessenger/types';

export const useOpenAlert = () => {
    const openAlert: IUsePanelMessengerOptions['handlers']['onAlert'] = data => {
        KitAlert[data.type]?.({
            ...data,
        });
    };

    return {
        openAlert,
    };
};
