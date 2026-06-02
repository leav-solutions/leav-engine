import {KitModal} from 'aristid-ds';
import {type IUsePanelMessengerOptions} from '_ui/hooks/usePanelMessenger/types';

export const useOpenConfirmModal = () => {
    const openConfirmModal: IUsePanelMessengerOptions['handlers']['onModalConfirm'] = data => {
        KitModal[data.type]?.({
            ...data,
            width: '100%',
            style: {content: {width: '90vw', maxWidth: '656px'}},
        });
    };

    return {
        openConfirmModal,
    };
};
