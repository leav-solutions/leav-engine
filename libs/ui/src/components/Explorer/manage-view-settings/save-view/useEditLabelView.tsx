// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FaEdit} from 'react-icons/fa';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {useState} from 'react';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import {IDataViewOnAction, IUserView} from '../../_types';
import useExecuteUpdateViewMutation from '../../_queries/useExecuteUpdateViewMutation';
import {LabelViewFormModal} from './LabelViewFormModal';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

const StyledButton = styled.button`
    all: unset;
`;

export const useEditLabelView = () => {
    const {t} = useSharedTranslation();
    const {updateView} = useExecuteUpdateViewMutation();
    const {dispatch} = useViewSettingsContext();
    const [dataViewOnAction, setDataViewOnAction] = useState<IDataViewOnAction>({id: null, label: null});

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
            title={t('explorer.viewList.edit-view')}
            onClick={() => setDataViewOnAction({id: viewItem.id, label: viewItem.label})}
        >
            <FaEdit />
        </StyledButton>
    );

    return {
        iconEditLabel,
        editViewModal: dataViewOnAction.id && dataViewOnAction.label && (
            <LabelViewFormModal
                viewData={dataViewOnAction.label}
                isOpen
                onSubmit={_onEditLabel}
                onClose={() => setDataViewOnAction({id: null, label: null})}
            />
        )
    };
};
