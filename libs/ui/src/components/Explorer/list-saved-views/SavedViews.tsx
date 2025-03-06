// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect, useState} from 'react';
import styled from 'styled-components';
import {KitRadio, KitTypography} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsContext} from '../manage-view-settings/store-view-settings/useViewSettingsContext';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {FaEdit} from 'react-icons/fa';
import {ViewActionsButtons} from '../manage-view-settings/save-view/ViewActionsButtons';
import {useLoadView} from '../useLoadView';
import {RadioChangeEvent} from 'antd';
import {useMeQuery} from '_ui/_gqlTypes';
import {LabelViewFormModal} from '../manage-view-settings/save-view/LabelViewFormModal';
import {ViewSettingsActionTypes} from '../manage-view-settings';
import useExecuteUpdateViewMutation from '../_queries/useExecuteUpdateViewMutation';

const ContentWrapperStyledDiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
`;

const StyledListViewsDiv = styled.div`
    display: flex;
    flex-direction: column;
`;

const StyleKitRadioGroup = styled(KitRadio.Group)`
    padding: calc(var(--general-spacing-s) * 1px) 0;
    margin: 0 0 calc(var(--general-spacing-xs) * 1px) 0;
    color: var(--general-utilities-text-primary);
    gap: calc(var(--general-spacing-xs) * 1px);
`;

const StyledViewDiv = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: calc(var(--general-spacing-xs) * 1px) 0;

    .edit {
        color: var(--general-utilities-main-default);
        font-size: calc(var(--general-typography-fontSize5) * 1px);
        flex: 0 0 auto;
        cursor: pointer;
        display: inline-block;
    }
`;

interface IDataViewToEdit {
    id: string | null;
    label: Record<string, string> | null;
}

export const SavedViews: FunctionComponent = () => {
    const {t} = useSharedTranslation();
    const {availableLangs} = useLang();
    const {view, dispatch} = useViewSettingsContext();
    const {updateView} = useExecuteUpdateViewMutation();
    const {loadView} = useLoadView();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataViewToEdit, setDataViewToEdit] = useState<IDataViewToEdit>({id: null, label: null});

    const [currentView, setCurrentView] = useState(
        view.savedViews.find(viewItem => view.viewId === viewItem.id) ?? undefined
    );

    const {data: userData} = useMeQuery();

    const isOwnerView = (ownerId: string | null) => ownerId === userData?.me?.whoAmI?.id;

    const sharedViews = view.savedViews.filter(viewItem => viewItem.shared);
    const myViews = view.savedViews.filter(viewItem => !viewItem.shared);

    useEffect(() => {
        setCurrentView(view.savedViews.find(viewItem => view.viewId === viewItem.id) ?? undefined);
    }, [view.viewId]);

    const _handleViewClick = (e: RadioChangeEvent) => {
        loadView(e.target.value);
    };

    const _onClickEdit = (id: string | null, label: Record<string, string>) => {
        setDataViewToEdit({id, label});
        _toggleModal();
    };

    const _toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const _onEditName = async (label: Record<string, string>) => {
        if (!dataViewToEdit.id) {
            return;
        }
        const mappedView = {
            id: dataViewToEdit.id,
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

    return (
        <>
            {isModalOpen && (
                <LabelViewFormModal
                    viewData={dataViewToEdit.label}
                    isOpen
                    onSubmit={_onEditName}
                    onClose={_toggleModal}
                />
            )}
            <ContentWrapperStyledDiv>
                <StyledListViewsDiv>
                    <StyleKitRadioGroup onChange={_handleViewClick} value={currentView?.id}>
                        <KitTypography.Title level="h4">{t('explorer.my-views')}</KitTypography.Title>
                        <StyledViewDiv>
                            <KitRadio value={undefined}>{t('explorer.default-view')}</KitRadio>
                        </StyledViewDiv>
                        {myViews.map(viewItem => (
                            <StyledViewDiv key={viewItem.id}>
                                <KitRadio value={viewItem.id}>
                                    {localizedTranslation(viewItem.label, availableLangs)}
                                </KitRadio>
                                <FaEdit className="edit" onClick={() => _onClickEdit(viewItem.id, viewItem.label)} />
                            </StyledViewDiv>
                        ))}
                    </StyleKitRadioGroup>
                    <StyleKitRadioGroup onChange={_handleViewClick} value={currentView?.id}>
                        <KitTypography.Title level="h4">{t('explorer.shared-views')}</KitTypography.Title>
                        {sharedViews.length === 0 ? (
                            <KitTypography.Text size="fontSize5">{t('explorer.no-shared-views')}</KitTypography.Text>
                        ) : (
                            sharedViews.map(viewItem => (
                                <StyledViewDiv key={viewItem.id}>
                                    <KitRadio value={viewItem.id}>
                                        {localizedTranslation(viewItem.label, availableLangs)}
                                    </KitRadio>
                                    {isOwnerView(viewItem.ownerId) ? (
                                        <FaEdit
                                            className="edit"
                                            onClick={() => _onClickEdit(viewItem.id, viewItem.label)}
                                        />
                                    ) : null}
                                </StyledViewDiv>
                            ))
                        )}
                    </StyleKitRadioGroup>
                </StyledListViewsDiv>
                <ViewActionsButtons />
            </ContentWrapperStyledDiv>
        </>
    );
};
