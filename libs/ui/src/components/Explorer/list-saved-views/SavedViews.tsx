// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect, useState} from 'react';
import styled from 'styled-components';
import {KitRadio, KitSpace, KitTypography} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsContext} from '../manage-view-settings/store-view-settings/useViewSettingsContext';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {ViewActionsButtons} from '../manage-view-settings/save-view/ViewActionsButtons';
import {useLoadView} from '../useLoadView';
import {RadioChangeEvent} from 'antd';
import {useMeQuery} from '_ui/_gqlTypes';
import {useDeleteView} from '../manage-view-settings/save-view/useDeleteView';
import {useEditLabelView} from '../manage-view-settings/save-view/useEditLabelView';
import {IUserView} from '../_types';

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
    padding: calc(var(--general-spacing-xs) * 1px);
    border-radius: calc(var(--general-border-radius-xs) * 1px);

    &.selected,
    &:has(label:hover),
    &:has(svg:hover) {
        background: var(--general-utilities-main-light);
    }
`;

const StyledIconsDiv = styled.div`
    .edit,
    .delete {
        font-size: calc(var(--general-typography-fontSize5) * 1px);
        flex: 0 0 auto;
        cursor: pointer;
        display: inline-block;
    }

    .edit {
        color: var(--general-utilities-main-default);
    }

    .delete {
        color: var(--general-utilities-error-default);
    }
`;

interface IDataViewOnAction {
    id: string | null;
    label: Record<string, string> | null;
}

export const SavedViews: FunctionComponent = () => {
    const {t} = useSharedTranslation();
    const {availableLangs} = useLang();
    const {view} = useViewSettingsContext();
    const {loadView} = useLoadView();
    const [dataViewOnAction, setDataViewOnAction] = useState<IDataViewOnAction>({id: null, label: null});
    const {iconDelete, deleteModal} = useDeleteView(dataViewOnAction, setDataViewOnAction);
    const {iconEditLabel, editViewModal} = useEditLabelView(dataViewOnAction, setDataViewOnAction);

    const [currentView, setCurrentView] = useState<IUserView | undefined>(
        view.savedViews.find(viewItem => view.viewId === viewItem.id) ?? undefined
    );

    const {data: userData} = useMeQuery();

    const isOwnerView = (ownerId: string | null) => ownerId === userData?.me?.whoAmI?.id;

    const sharedViews = view.savedViews.filter(viewItem => viewItem.shared);
    const myViews = view.savedViews.filter(viewItem => !viewItem.shared);

    const _getViewClassName = (viewId: string | null) => (view.viewId === viewId ? 'selected' : '');

    useEffect(() => {
        setCurrentView(view.savedViews.find(viewItem => view.viewId === viewItem.id) ?? undefined);
    }, [view.viewId]);

    const _onClickLoadView = (e: RadioChangeEvent) => {
        loadView(e.target.value);
    };

    return (
        <>
            {editViewModal}
            {deleteModal}
            <ContentWrapperStyledDiv>
                <StyledListViewsDiv>
                    <StyleKitRadioGroup onChange={_onClickLoadView} value={currentView?.id}>
                        <KitTypography.Title level="h4">{t('explorer.my-views')}</KitTypography.Title>
                        <StyledViewDiv className={_getViewClassName(null)}>
                            <KitRadio value={undefined}>{t('explorer.default-view')}</KitRadio>
                        </StyledViewDiv>
                        {myViews.map(viewItem => (
                            <StyledViewDiv className={_getViewClassName(viewItem.id)} key={viewItem.id}>
                                <KitRadio value={viewItem.id}>
                                    {localizedTranslation(viewItem.label, availableLangs)}
                                </KitRadio>
                                <StyledIconsDiv>
                                    <KitSpace>
                                        {iconEditLabel(viewItem)}
                                        {iconDelete(viewItem)}
                                    </KitSpace>
                                </StyledIconsDiv>
                            </StyledViewDiv>
                        ))}
                    </StyleKitRadioGroup>
                    <StyleKitRadioGroup onChange={_onClickLoadView} value={currentView?.id}>
                        <KitTypography.Title level="h4">{t('explorer.shared-views')}</KitTypography.Title>
                        {sharedViews.length === 0 ? (
                            <KitTypography.Text size="fontSize5">{t('explorer.no-shared-views')}</KitTypography.Text>
                        ) : (
                            sharedViews.map(viewItem => (
                                <StyledViewDiv className={_getViewClassName(viewItem.id)} key={viewItem.id}>
                                    <KitRadio value={viewItem.id}>
                                        {localizedTranslation(viewItem.label, availableLangs)}
                                    </KitRadio>
                                    <StyledIconsDiv>
                                        {isOwnerView(viewItem.ownerId) ? (
                                            <KitSpace>
                                                {iconEditLabel(viewItem)}
                                                {iconDelete(viewItem)}
                                            </KitSpace>
                                        ) : null}
                                    </StyledIconsDiv>
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
