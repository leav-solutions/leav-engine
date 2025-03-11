// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitModal, KitTypography} from 'aristid-ds';
import {FaTimes, FaTrash} from 'react-icons/fa';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {ComponentProps, useState} from 'react';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import useExecuteDeleteViewMutation from '_ui/hooks/useExecuteDeleteViewMutation/useExecuteDeleteViewMutation';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {IUserView, IDataViewOnAction} from '../../_types';
import styled from 'styled-components';
import {Button} from 'antd';

const StyledButton = styled.button`
    all: unset;
`;

export const useDeleteView = () => {
    const {t} = useSharedTranslation();
    const {availableLangs} = useLang();
    const {deleteView} = useExecuteDeleteViewMutation();
    const {dispatch} = useViewSettingsContext();
    const [dataViewOnAction, setDataViewOnAction] = useState<IDataViewOnAction>({id: null, label: null});

    const _onDeleteConfirm: ComponentProps<typeof Button>['onClick'] = async () => {
        if (!dataViewOnAction.id) {
            return;
        }
        const {data} = await deleteView(dataViewOnAction.id);

        if (data) {
            dispatch({
                type: ViewSettingsActionTypes.DELETE_VIEW,
                payload: {
                    id: dataViewOnAction.id
                }
            });
        }
        setDataViewOnAction({id: null, label: null});
    };

    const iconDelete = (viewItem: IUserView) => (
        <StyledButton
            className="delete"
            title={t('explorer.viewList.delete-view')}
            onClick={() => {
                setDataViewOnAction({id: viewItem.id, label: viewItem.label});
            }}
        >
            <FaTrash />
        </StyledButton>
    );

    return {
        iconDelete,
        deleteModal: dataViewOnAction.id && dataViewOnAction.label && (
            <KitModal
                appElement={document.body}
                title={t('explorer.viewList.confirm-delete-view')}
                isOpen={!!dataViewOnAction.id && !!dataViewOnAction.label}
                footer={
                    <>
                        <KitButton
                            type="secondary"
                            onClick={() => setDataViewOnAction({id: null, label: null})}
                            icon={<FaTimes />}
                        >
                            {t('global.close')}
                        </KitButton>
                        <KitButton type="primary" danger onClick={_onDeleteConfirm} icon={<FaTrash />}>
                            {t('global.delete')}
                        </KitButton>
                    </>
                }
            >
                <KitTypography.Text size="fontSize3" weight="medium">
                    {localizedTranslation(dataViewOnAction.label, availableLangs)}
                </KitTypography.Text>
            </KitModal>
        )
    };
};
