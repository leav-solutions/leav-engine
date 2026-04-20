// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useConfirmModal} from '_ui/hooks/useConfirmModal';
import {KitButton} from 'aristid-ds';
import {type FunctionComponent} from 'react';

interface IDeleteAllValuesButtonProps {
    handleDelete: () => void;
    disabled?: boolean;
    danger?: boolean;
}

export const DeleteAllValuesButton: FunctionComponent<IDeleteAllValuesButtonProps> = ({
    handleDelete,
    disabled,
    danger,
}) => {
    const {t} = useSharedTranslation();
    const {openConfirmModal} = useConfirmModal();

    const _confirmDeleteAllValues = () => {
        openConfirmModal({
            title: t('record_edition.delete_all_values'),
            content: t('record_edition.delete_all_values_confirm'),
            dangerConfirm: true,
            onOk: handleDelete,
        });
    };

    return (
        <KitButton type="tertiary" size="s" onClick={_confirmDeleteAllValues} disabled={disabled} danger={danger}>
            {t('record_edition.delete_all')}
        </KitButton>
    );
};
