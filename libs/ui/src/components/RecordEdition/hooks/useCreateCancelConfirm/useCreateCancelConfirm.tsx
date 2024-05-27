// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitModal, KitSpace, KitTypography} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
export type UseCreateCancelConfirmHook = (onConfirm: () => void) => () => void;

export const useCreateCancelConfirm: UseCreateCancelConfirmHook = onConfirm => {
    const {t} = useSharedTranslation();

    const confirmContent = (
        <KitSpace direction="vertical">
            <span>{t('record_edition.cancel_confirm_modal_content')}</span>
            <KitTypography.Text weight="medium">{t('record_edition.cancel_confirm_modal_question')}</KitTypography.Text>
        </KitSpace>
    );

    return () => {
        KitModal.confirm({
            title: t('record_edition.cancel_confirm_modal_title'),
            content: confirmContent,
            icon: false,
            showSecondaryCta: true,
            showCloseIcon: false,
            dangerConfirm: true,
            type: 'confirm',
            okText: t('global.confirm'),
            cancelText: t('global.cancel'),
            onOk: onConfirm
        });
    };
};
