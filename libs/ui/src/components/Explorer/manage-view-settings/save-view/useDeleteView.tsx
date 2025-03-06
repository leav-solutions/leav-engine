// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitModal, KitTypography} from 'aristid-ds';
import {FaTimes, FaTrash} from 'react-icons/fa';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {useState} from 'react';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import useExecuteDeleteViewMutation from '_ui/hooks/useExecuteDeleteViewMutation/useExecuteDeleteViewMutation';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {IUserView} from '../../_types';

interface IDataViewOnAction {
    id: string | null;
    label: Record<string, string> | null;
}

export const useDeleteView = (
    dataViewOnAction: IDataViewOnAction,
    setDataViewOnAction: (dataViewOnAction: IDataViewOnAction) => void
) => {
    const {t} = useSharedTranslation();
    const {availableLangs} = useLang();
    const {deleteView} = useExecuteDeleteViewMutation();
    const {dispatch} = useViewSettingsContext();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const _toggleDeleteModal = () => {
        setIsDeleteModalOpen(!isDeleteModalOpen);
    };

    const _onClickDelete = (id: string | null, label: Record<string, string>) => {
        setDataViewOnAction({id, label});
        _toggleDeleteModal();
    };

    const _onDeleteConfirm = async () => {
        if (!dataViewOnAction.id) {
            return;
        }
        const {data} = await deleteView(dataViewOnAction.id);

        if (data) {
            dispatch({
                type: ViewSettingsActionTypes.DELETE_VIEW,
                payload: {
                    id: data.deleteView.id
                }
            });
        }
        setIsDeleteModalOpen(!isDeleteModalOpen);
    };

    const iconDelete = (viewItem: IUserView) => (
        <FaTrash className="delete" onClick={() => _onClickDelete(viewItem.id, viewItem.label)} />
    );

    return {
        iconDelete,
        deleteModal: isDeleteModalOpen && (
            <KitModal
                title={t('explorer.delete-view')}
                isOpen={isDeleteModalOpen}
                footer={
                    <>
                        <KitButton type="secondary" onClick={_toggleDeleteModal} icon={<FaTimes />}>
                            {t('global.close')}
                        </KitButton>
                        <KitButton type="primary" danger onClick={_onDeleteConfirm} icon={<FaTrash />}>
                            {t('global.delete')}
                        </KitButton>
                    </>
                }
            >
                <KitTypography.Text size="fontSize3" weight="medium">
                    {localizedTranslation(dataViewOnAction.label!, availableLangs)}
                </KitTypography.Text>
            </KitModal>
        )
    };
};
