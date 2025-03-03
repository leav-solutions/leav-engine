// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitModal} from 'aristid-ds';
import {FunctionComponent} from 'react';

export const DeleteAllValuesButton: FunctionComponent<{handleDelete: () => Promise<void>; disabled?: boolean}> = ({
    handleDelete,
    disabled
}) => {
    const {t} = useSharedTranslation();

    const _confirmDeleteAllValues = () => {
        KitModal.confirm({
            title: t('record_edition.delete_all_values'),
            content: t('record_edition.delete_all_values_confirm'),
            icon: false,
            showSecondaryCta: true,
            showCloseIcon: false,
            dangerConfirm: true,
            type: 'confirm',
            okText: t('global.confirm'),
            cancelText: t('global.cancel'),
            onOk: handleDelete
        });
    };

    return (
        <KitButton type="tertiary" size="s" onClick={_confirmDeleteAllValues} disabled={disabled}>
            {t('record_edition.delete_all')}
        </KitButton>
    );
};
