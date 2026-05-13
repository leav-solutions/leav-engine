import {KitModal} from 'aristid-ds';
import {type IUseIFrameMessengerOptions} from '_ui/hooks/useIFrameMessenger/types';

export const useOpenConfirmModal = () => {
    const openConfirmModal: IUseIFrameMessengerOptions['handlers']['onModalConfirm'] = data => {
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
