import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useConfirmModal} from '_ui/hooks/useConfirmModal/useConfirmModal';
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
