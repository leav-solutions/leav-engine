import {KitSpace, KitTypography} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useConfirmModal} from '_ui/hooks/useConfirmModal/useConfirmModal';

export type UseCreateCancelConfirmHook = (onConfirm: () => void) => () => void;

export const useCreateCancelConfirm: UseCreateCancelConfirmHook = onConfirm => {
    const {t} = useSharedTranslation();
    const {openConfirmModal} = useConfirmModal();

    const confirmContent = (
        <KitSpace direction="vertical">
            <span>{t('record_edition.cancel_confirm_modal_content')}</span>
            <KitTypography.Text weight="medium">{t('record_edition.cancel_confirm_modal_question')}</KitTypography.Text>
        </KitSpace>
    );

    return () => {
        openConfirmModal({
            title: t('record_edition.cancel_confirm_modal_title'),
            content: confirmContent,
            dangerConfirm: true,
            onOk: onConfirm,
        });
    };
};
