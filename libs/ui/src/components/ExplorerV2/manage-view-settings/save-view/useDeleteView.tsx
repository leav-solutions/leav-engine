import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitButton, KitModal, KitTypography} from 'aristid-ds';
import {useViewSettingsContext} from '../store-view-settings/useViewSettingsContext';
import {type ComponentProps, useState} from 'react';
import {ViewSettingsActionTypes} from '../store-view-settings/viewSettingsReducer';
import useExecuteDeleteViewMutation from '_ui/hooks/useExecuteDeleteViewMutation/useExecuteDeleteViewMutation';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {type IUserView, type IDataViewOnAction} from '../../_types';
import styled from 'styled-components';
import {type Button} from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes, faTrash} from '@fortawesome/free-solid-svg-icons';

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
                    id: dataViewOnAction.id,
                },
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
            <FontAwesomeIcon icon={faTrash} />
        </StyledButton>
    );

    return {
        iconDelete,
        deleteModal: dataViewOnAction.id && dataViewOnAction.label && (
            <KitModal
                appElement={document.getElementById('root')}
                title={t('explorer.viewList.confirm-delete-view')}
                isOpen={!!dataViewOnAction.id && !!dataViewOnAction.label}
                footer={
                    <>
                        <KitButton
                            type="secondary"
                            onClick={() => setDataViewOnAction({id: null, label: null})}
                            icon={<FontAwesomeIcon icon={faTimes} />}
                        >
                            {t('global.close')}
                        </KitButton>
                        <KitButton
                            type="primary"
                            danger
                            onClick={_onDeleteConfirm}
                            icon={<FontAwesomeIcon icon={faTrash} />}
                        >
                            {t('global.delete')}
                        </KitButton>
                    </>
                }
            >
                <KitTypography.Text size="fontSize3" weight="medium">
                    {localizedTranslation(dataViewOnAction.label, availableLangs)}
                </KitTypography.Text>
            </KitModal>
        ),
    };
};
