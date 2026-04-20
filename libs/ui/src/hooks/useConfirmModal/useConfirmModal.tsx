// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitModal} from 'aristid-ds';
import {useSharedTranslation} from '../useSharedTranslation';

type KitConfirmParams = Parameters<typeof KitModal.confirm>[0];

type ConfirmModalParams = Omit<
    KitConfirmParams,
    'type' | 'icon' | 'width' | 'cancelText' | 'title' | 'content' | 'onOk'
> &
    Required<Pick<KitConfirmParams, 'title' | 'content' | 'onOk'>>;

export const useConfirmModal = () => {
    const {t} = useSharedTranslation();

    const openConfirmModal = ({title, content, onOk, dangerConfirm, okText, ...rest}: ConfirmModalParams) => {
        KitModal.confirm({
            width: '100%',
            style: {content: {width: '90vw', maxWidth: '656px'}},
            type: 'confirm',
            icon: false,
            title,
            content,
            okText: okText ?? t('global.confirm') ?? undefined,
            cancelText: t('global.cancel') ?? undefined,
            onOk,
            dangerConfirm,
            ...rest,
        });
    };

    return {openConfirmModal};
};
