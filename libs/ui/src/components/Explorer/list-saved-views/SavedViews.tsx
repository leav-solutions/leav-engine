// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import {KitRadio, KitSpace, KitTypography} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsContext} from '../manage-view-settings/store-view-settings/useViewSettingsContext';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {FaEdit} from 'react-icons/fa';
import {ViewActionsButtons} from '../manage-view-settings/save-view/ViewActionsButtons';
import {useLoadView} from '../useLoadView';
import {RadioChangeEvent} from 'antd';
import {useMeQuery} from '_ui/_gqlTypes';
import {IUserView} from '../_types';
import {SaveViewModal} from '../manage-view-settings/save-view/SaveViewModal';
import {prepareViewForRequest} from '../manage-view-settings/save-view/prepareViewForRequest';
import useExecuteSaveViewMutation from '_ui/hooks/useExecuteSaveViewMutation';
import {IViewDisplay} from '_ui/types';
import {mapViewTypeFromExplorerToLegacy} from '../_constants';
import {ViewSettingsActionTypes} from '../manage-view-settings';
import {useTransformFilters} from '../manage-view-settings/_shared/useTransformFilters';

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
    list-style: none;
    color: var(--general-utilities-text-primary);
    display: flex;
    flex-direction: column;
    gap: calc(var(--general-spacing-xs) * 1px);
`;

const StyledViewDiv = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 5px 0;

    .check {
        color: var(--general-utilities-main-default);
        margin-left: calc(var(--general-spacing-xs) * 1px);
        font-size: calc(var(--general-typography-fontSize5) * 1px);
        flex: 0 0 auto;
        cursor: pointer;
        display: inline-block;
    }
`;

export const SavedViews: FunctionComponent = () => {
    const {t} = useSharedTranslation();
    const {view, dispatch} = useViewSettingsContext();
    const {availableLangs} = useLang();
    const {loadView} = useLoadView();
    const {toValidFilters} = useTransformFilters();
    const {saveView} = useExecuteSaveViewMutation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewData, setViewData] = useState();

    const sharedViews = view.savedViews.filter(viewItem => viewItem.shared);
    const myViews = view.savedViews.filter(viewItem => !viewItem.shared);

    const [viewSelected, setViewSelected] = useState(
        myViews.find(viewItem => view.viewId === viewItem.id)?.id ??
            sharedViews.find(viewItem => view.viewId === viewItem.id)?.id ??
            undefined
    );

    const {data: userData} = useMeQuery();

    const isOwnerView = (ownerId: string | null) => ownerId === userData?.me?.whoAmI?.id;

    useEffect(() => {
        setViewSelected(
            myViews.find(viewItem => view.viewId === viewItem.id)?.id ??
                sharedViews.find(viewItem => view.viewId === viewItem.id)?.id ??
                undefined
        );
    }, [view.viewId]);

    const _handleViewClick = (e: RadioChangeEvent) => {
        loadView(e.target.value);
    };

    const onEdit = (id: string | null, label: Record<string, string>) => {
        console.log({id});
        setViewData({id, label});
        _toggleModal();
    };

    const _toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const _editView = async (label: Record<string, string>) => {
        const mappedView = {
            ...prepareViewForRequest(view, label),
            id: view.viewId
        };

        console.log({mappedView});

        // const {data} = await saveView({
        //     view: mappedView
        // });

        // if (data) {
        //     dispatch({
        //         type: ViewSettingsActionTypes.UPDATE_VIEWS,
        //         payload: {
        //             id: data.saveView.id,
        //             ownerId: data.saveView.created_by.id,
        //             label: data.saveView.label,
        //             shared: data.saveView.shared,
        //             filters: toValidFilters(data.saveView.filters),
        //             sort: data.saveView.sort ?? [],
        //             display: (data.saveView.display as IViewDisplay) ?? {
        //                 type: mapViewTypeFromExplorerToLegacy[view.viewType]
        //             },
        //             attributes: data.saveView?.attributes?.map(({id}) => id) ?? []
        //         }
        //     });
        // }
    };

    return (
        <>
            <SaveViewModal viewData={viewData} isOpen={isModalOpen} onSave={_editView} onClose={_toggleModal} />
            <ContentWrapperStyledDiv>
                <StyledListViewsDiv>
                    <KitTypography.Title level="h4">{t('explorer.my-views')}</KitTypography.Title>
                    <StyleKitRadioGroup onChange={_handleViewClick} value={viewSelected}>
                        <KitSpace direction="vertical">
                            <KitRadio value={undefined}>{t('explorer.default-view')}</KitRadio>
                            {myViews.map(viewItem => (
                                <StyledViewDiv key={viewItem.id}>
                                    <KitRadio value={viewItem.id}>
                                        {localizedTranslation(viewItem.label, availableLangs)}
                                    </KitRadio>
                                    <FaEdit className="check" onClick={() => onEdit(viewItem.id, viewItem.label)} />
                                </StyledViewDiv>
                            ))}
                        </KitSpace>
                    </StyleKitRadioGroup>
                    <StyleKitRadioGroup onChange={_handleViewClick} value={viewSelected}>
                        <KitSpace direction="vertical">
                            <KitTypography.Title level="h4">{t('explorer.shared-views')}</KitTypography.Title>
                            {sharedViews.length === 0 ? (
                                <KitTypography.Text size="fontSize5">
                                    {t('explorer.no-shared-views')}
                                </KitTypography.Text>
                            ) : (
                                sharedViews.map(viewItem => (
                                    <StyledViewDiv key={viewItem.id}>
                                        <KitRadio value={viewItem.id}>
                                            {localizedTranslation(viewItem.label, availableLangs)}
                                        </KitRadio>
                                        {isOwnerView(viewItem.ownerId) ? (
                                            <FaEdit
                                                className="check"
                                                onClick={() => onEdit(viewItem.id, viewItem.label)}
                                            />
                                        ) : null}
                                    </StyledViewDiv>
                                ))
                            )}
                        </KitSpace>
                    </StyleKitRadioGroup>
                </StyledListViewsDiv>
                <ViewActionsButtons />
            </ContentWrapperStyledDiv>
        </>
    );
};
