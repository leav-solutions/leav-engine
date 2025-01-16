// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {createPortal} from 'react-dom';
import {KitEmpty, KitSpace, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {DefaultViewSettings, Entrypoint, IItemAction, IPrimaryAction} from './_types';
import {useExplorerData} from './_queries/useExplorerData';
import {DataView} from './DataView';
import {useRemoveAction} from './useRemoveAction';
import {useEditAction} from './useEditAction';
import {usePrimaryActionsButton} from './usePrimaryActions';
import {ExplorerTitle} from './ExplorerTitle';
import {useCreateAction} from './useCreateAction';
import {
    defaultPageSizeOptions,
    SidePanel,
    useEditSettings,
    useOpenViewSettings,
    ViewSettingsContext
} from './manage-view-settings';
import {useSearchInput} from './useSearchInput';
import {usePagination} from './usePagination';
import {Loading} from '../Loading';
import {ExplorerToolBar} from './display-view-filters/ExplorerToolBar';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useViewSettingsReducer} from './useViewSettingsReducer';

const isNotEmpty = <T extends unknown[]>(union: T): union is Exclude<T, []> => union.length > 0;

const emptyArray = [];
const emptyObject = {};

const ExplorerHeaderDivStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: calc(var(--general-spacing-xs) * 1px);
`;

const ExplorerPageDivStyled = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
`;

interface IExplorerProps {
    entrypoint: Entrypoint;
    noPagination?: true;
    itemActions?: IItemAction[];
    primaryActions?: IPrimaryAction[];
    title?: string;
    defaultActionsForItem?: Array<'edit' | 'remove'>;
    defaultPrimaryActions?: Array<'create'>;
    defaultViewSettings?: DefaultViewSettings;
}

export const Explorer: FunctionComponent<IExplorerProps> = ({
    entrypoint,
    itemActions,
    primaryActions,
    title,
    noPagination,
    defaultActionsForItem = ['edit', 'remove'],
    defaultPrimaryActions = ['create'],
    defaultViewSettings
}) => {
    const {t} = useSharedTranslation();

    const {panelElement} = useEditSettings();

    const {loading: viewSettingsLoading, view, dispatch} = useViewSettingsReducer(entrypoint, defaultViewSettings);

    const {currentPage, setNewPageSize, setNewPage} = usePagination(dispatch);

    const {
        data,
        loading: loadingData,
        refetch
    } = useExplorerData({
        entrypoint,
        libraryId: view.libraryId,
        attributeIds: view.attributesIds,
        fulltextSearch: view.fulltextSearch,
        pagination: noPagination ? null : {limit: view.pageSize, offset: view.pageSize * (currentPage - 1)},
        sorts: view.sort,
        filters: view.filters,
        skip: viewSettingsLoading
    }); // TODO: refresh when go back on page

    const {removeAction} = useRemoveAction(
        {
            isEnabled: isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('remove')
        },
        entrypoint
    );

    const {editAction, editModal} = useEditAction({
        isEnabled: isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('edit')
    });

    const {createAction, createModal} = useCreateAction({
        isEnabled: isNotEmpty(defaultPrimaryActions) && defaultPrimaryActions.includes('create'),
        library: view.libraryId,
        refetch
    });

    const {primaryButton} = usePrimaryActionsButton([createAction, ...(primaryActions ?? [])].filter(Boolean));

    const {viewSettingsButton} = useOpenViewSettings(view.libraryId);

    const {searchInput} = useSearchInput({view, dispatch});

    const hasNoResults = data === null || data.totalCount === 0;

    return (
        <ViewSettingsContext.Provider value={{view, dispatch}}>
            <ExplorerPageDivStyled>
                <ExplorerHeaderDivStyled>
                    <KitTypography.Title level="h1">
                        {
                            !viewSettingsLoading && (
                                <ExplorerTitle library={view.libraryId} title={title} entrypoint={entrypoint} />
                            ) /*TODO: manage loading*/
                        }
                    </KitTypography.Title>
                    <KitSpace size="xs">
                        {searchInput}
                        {viewSettingsButton}
                        {primaryButton}
                    </KitSpace>
                </ExplorerHeaderDivStyled>
                {!viewSettingsLoading && <ExplorerToolBar libraryId={view.libraryId} />}
                {loadingData || viewSettingsLoading ? (
                    <Loading />
                ) : hasNoResults ? (
                    <KitEmpty title={t('explorer.empty-data')} />
                ) : (
                    <DataView
                        dataGroupedFilteredSorted={data?.records ?? emptyArray}
                        attributesProperties={data?.attributes ?? emptyObject}
                        attributesToDisplay={['whoAmI', ...view.attributesIds]}
                        paginationProps={
                            entrypoint.type === 'library'
                                ? {
                                      pageSizeOptions: defaultPageSizeOptions,
                                      currentPage,
                                      pageSize: view.pageSize,
                                      setNewPageSize,
                                      setNewPage,
                                      totalItems: data?.totalCount ?? 0
                                  }
                                : undefined
                        }
                        itemActions={[editAction, removeAction, ...(itemActions ?? emptyArray)].filter(Boolean)}
                    />
                )}
            </ExplorerPageDivStyled>
            {panelElement && createPortal(<SidePanel />, panelElement)}
            {editModal}
            {createModal}
        </ViewSettingsContext.Provider>
    );
};
