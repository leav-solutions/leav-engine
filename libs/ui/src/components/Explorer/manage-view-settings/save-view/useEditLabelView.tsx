// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FaEdit} from 'react-icons/fa';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {useState} from 'react';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import {IUserView} from '../../_types';
import useExecuteUpdateViewMutation from '../../_queries/useExecuteUpdateViewMutation';
import {LabelViewFormModal} from './LabelViewFormModal';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const StyledButton = styled.button`
    all: unset;
`;

interface IDataViewOnAction {
    id: string | null;
    label: Record<string, string> | null;
}

export const useEditLabelView = (
    dataViewOnAction: IDataViewOnAction,
    setDataViewOnAction: (dataViewOnAction: IDataViewOnAction) => void
) => {
    const {t} = useSharedTranslation();
    const {updateView} = useExecuteUpdateViewMutation();
    const {dispatch} = useViewSettingsContext();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const _toggleEditModal = () => {
        setIsEditModalOpen(!isEditModalOpen);
    };

    const _onClickEdit = (id: string | null, label: Record<string, string>) => {
        setDataViewOnAction({id, label});
        _toggleEditModal();
    };

    const _onEditLabel = async (label: Record<string, string>) => {
        if (!dataViewOnAction.id) {
            return;
        }
        const mappedView = {
            id: dataViewOnAction.id,
            label
        };

        const {data} = await updateView({
            view: mappedView
        });

        if (data) {
            dispatch({
                type: ViewSettingsActionTypes.RENAME_VIEW,
                payload: {
                    id: data.updateView.id,
                    label: data.updateView.label
                }
            });
        }
    };

    const iconEditLabel = (viewItem: IUserView) => (
        <StyledButton
            className="edit"
            title={t('explorer.edit-view')}
            onClick={() => _onClickEdit(viewItem.id, viewItem.label)}
        >
            <FaEdit />
        </StyledButton>
    );

    return {
        iconEditLabel,
        editViewModal: isEditModalOpen && (
            <LabelViewFormModal
                viewData={dataViewOnAction.label}
                isOpen
                onSubmit={_onEditLabel}
                onClose={_toggleEditModal}
            />
        )
    };
};
