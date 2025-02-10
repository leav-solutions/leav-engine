// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {KitEmpty, KitSpace, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {Loading} from '_ui/components/Loading';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {DefaultViewSettings, Entrypoint, IItemAction, IMassActions, IPrimaryAction} from './_types';
import {useExplorerData} from './_queries/useExplorerData';
import {DataView} from './DataView';
import {ExplorerTitle} from './ExplorerTitle';
import {ExplorerToolbar} from './ExplorerToolbar';
import {useRemoveAction} from './useRemoveAction';
import {useEditAction} from './useEditAction';
import {usePrimaryActionsButton} from './usePrimaryActions';
import {useCreateAction} from './useCreateAction';
import {useMassActions} from './useMassActions';
import {
    defaultPageSizeOptions,
    SidePanel,
    useEditSettings,
    useOpenViewSettings,
    ViewSettingsContext
} from './manage-view-settings';
import {useSearchInput} from './useSearchInput';
import {usePagination} from './usePagination';
import {useViewSettingsReducer} from './useViewSettingsReducer';
import {useDeactivateMassAction} from './useDeactivateMassAction';
import {MASS_SELECTION_ALL} from './_constants';

const isNotEmpty = <T extends unknown[]>(union: T): union is Exclude<T, []> => union.length > 0;

const emptyArray = [];
const emptyObject = {};

const ExplorerHeaderDivStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: calc(var(--general-spacing-xs) * 1px);
    padding-right: calc(var(--general-spacing-xxs) * 1px);
`;

const ExplorerPageDivStyled = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
`;

const ExplorerEmptyDataStyled = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

interface IExplorerProps {
    entrypoint: Entrypoint;
    noPagination?: true;
    itemActions?: IItemAction[];
    primaryActions?: IPrimaryAction[];
    massActions?: IMassActions[];
    title?: string;
    emptyPlaceholder?: ReactNode;
    defaultActionsForItem?: Array<'edit' | 'remove'>;
    defaultPrimaryActions?: Array<'create'>;
    defaultMassActions?: Array<'deactivate'>;
    defaultViewSettings?: DefaultViewSettings;
}

export const Explorer: FunctionComponent<IExplorerProps> = ({
    entrypoint,
    noPagination,
    itemActions = [],
    primaryActions = [],
    massActions = [],
    title,
    emptyPlaceholder,
    defaultActionsForItem = ['edit', 'remove'],
    defaultPrimaryActions = ['create'],
    defaultMassActions = ['deactivate'],
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
    const isMassSelectionAll = view.massSelection === MASS_SELECTION_ALL;

    const {removeAction} = useRemoveAction({
        isEnabled: isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('remove'),
        store: {view, dispatch},
        entrypoint
    });

    const {editAction, editModal} = useEditAction({
        isEnabled: isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('edit')
    });

    const {createAction, createModal} = useCreateAction({
        isEnabled: isNotEmpty(defaultPrimaryActions) && defaultPrimaryActions.includes('create'),
        library: view.libraryId,
        entrypoint: view.entrypoint,
        itemsCount: data?.totalCount ?? 0,
        refetch
    });

    const totalCount = data?.totalCount ?? 0;
    const allVisibleKeys = data?.records.map(({key}) => key) ?? [];

    const {deactivateMassAction} = useDeactivateMassAction({
        isEnabled: isNotEmpty(defaultMassActions) && defaultMassActions.includes('deactivate'),
        store: {view, dispatch},
        allVisibleKeys,
        refetch
    });

    const {setSelectedKeys, selectAllButton} = useMassActions({
        isEnabled: totalCount > 0 && (isNotEmpty(defaultMassActions) || isNotEmpty(massActions)),
        store: {view, dispatch},
        totalCount,
        allVisibleKeys,
        massActions: [deactivateMassAction, ...massActions].filter(Boolean)
    });

    const {primaryButton} = usePrimaryActionsButton([createAction, ...primaryActions].filter(Boolean));

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
                    {!isMassSelectionAll && (
                        <KitSpace size="xs">
                            {searchInput}
                            {viewSettingsButton}
                            {primaryButton}
                        </KitSpace>
                    )}
                </ExplorerHeaderDivStyled>
                {!viewSettingsLoading && (
                    <ExplorerToolbar libraryId={view.libraryId} isMassSelectionAll={isMassSelectionAll}>
                        {selectAllButton}
                    </ExplorerToolbar>
                )}
                {loadingData || viewSettingsLoading ? (
                    <Loading />
                ) : hasNoResults ? (
                    <ExplorerEmptyDataStyled>
                        {emptyPlaceholder || <KitEmpty title={t('explorer.empty-data')} />}
                    </ExplorerEmptyDataStyled>
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
                                      totalCount
                                  }
                                : undefined
                        }
                        itemActions={[editAction, removeAction, ...itemActions].filter(Boolean).map(action => ({
                            ...action,
                            disabled: isMassSelectionAll
                        }))}
                        selection={{
                            onSelectionChange: setSelectedKeys,
                            isMassSelectionAll,
                            selectedKeys: isMassSelectionAll
                                ? data?.records.map(({whoAmI}) => whoAmI.id)
                                : (view.massSelection as string[])
                        }}
                    />
                )}
            </ExplorerPageDivStyled>
            {panelElement && createPortal(<SidePanel />, panelElement)}
            {editModal}
            {createModal}
        </ViewSettingsContext.Provider>
    );
};
