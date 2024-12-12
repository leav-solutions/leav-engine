// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent, useMemo, useReducer} from 'react';
import {createPortal} from 'react-dom';
import {KitEmpty, KitSpace, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {IItemAction, IPrimaryAction} from './_types';
import {useExplorerData} from './_queries/useExplorerData';
import {DataView} from './DataView';
import {useDeactivateAction} from './useDeactivateAction';
import {useEditAction} from './useEditAction';
import {usePrimaryActionsButton} from './usePrimaryActions';
import {ExplorerTitle} from './ExplorerTitle';
import {useCreateAction} from './useCreateAction';
import {
    type IViewSettingsState,
    SidePanel,
    useEditSettings,
    useOpenViewSettings,
    ViewSettingsContext,
    viewSettingsInitialState,
    defaultPageSizeOptions,
    viewSettingsReducer
} from './manage-view-settings';
import {useSearchInput} from './useSearchInput';
import {usePagination} from './usePagination';
import {Loading} from '../Loading';
import {ExplorerFilterBar} from './display-view-filters/ExplorerFilterBar';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {Empty} from 'antd';

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
    noPagination?: true;
    library: string;
    itemActions?: IItemAction[];
    primaryActions?: IPrimaryAction[];
    title?: string;
    defaultActionsForItem?: Array<'edit' | 'deactivate'>;
    defaultPrimaryActions?: Array<'create'>;
    defaultViewSettings?: Partial<IViewSettingsState>;
}

export const Explorer: FunctionComponent<IExplorerProps> = ({
    library,
    itemActions,
    primaryActions,
    title,
    noPagination,
    defaultActionsForItem = ['edit', 'deactivate'],
    defaultPrimaryActions = ['create'],
    defaultViewSettings
}) => {
    const {t} = useSharedTranslation();

    const {panelElement} = useEditSettings();

    const [view, dispatch] = useReducer(viewSettingsReducer, {
        ...viewSettingsInitialState,
        ...defaultViewSettings,
        maxFilters: defaultViewSettings?.maxFilters ?? viewSettingsInitialState.maxFilters
    });

    const {currentPage, setNewPageSize, setNewPage} = usePagination(dispatch);

    const {data, loading, refetch} = useExplorerData({
        libraryId: library,
        attributeIds: view.attributesIds,
        fulltextSearch: view.fulltextSearch,
        pagination: noPagination ? null : {limit: view.pageSize, offset: view.pageSize * (currentPage - 1)},
        sorts: view.sort,
        filters: view.filters
    }); // TODO: refresh when go back on page

    const {deactivateAction} = useDeactivateAction({
        isEnabled: isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('deactivate')
    });

    const {editAction, editModal} = useEditAction({
        isEnabled: isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('edit')
    });

    const {createAction, createModal} = useCreateAction({
        isEnabled: isNotEmpty(defaultPrimaryActions) && defaultPrimaryActions.includes('create'),
        library,
        refetch
    });

    const {primaryButton} = usePrimaryActionsButton([createAction, ...(primaryActions ?? [])].filter(Boolean));

    const {viewSettingsButton} = useOpenViewSettings(library);

    const {searchInput} = useSearchInput({view, dispatch});

    return (
        <ViewSettingsContext.Provider value={{view, dispatch}}>
            <ExplorerPageDivStyled>
                <ExplorerHeaderDivStyled>
                    <KitTypography.Title level="h1">
                        <ExplorerTitle library={library} title={title} />
                    </KitTypography.Title>
                    <KitSpace size="xs">
                        {searchInput}
                        {viewSettingsButton}
                        {primaryButton}
                    </KitSpace>
                </ExplorerHeaderDivStyled>
                <ExplorerFilterBar />
                {loading ? (
                    <Loading />
                ) : data === null ? (
                    <KitEmpty title={t('explorer.empty-data')} />
                ) : (
                    <DataView
                        dataGroupedFilteredSorted={data?.records ?? emptyArray}
                        attributesProperties={data?.attributes ?? emptyObject}
                        attributesToDisplay={['whoAmI', ...view.attributesIds]}
                        paginationProps={{
                            pageSizeOptions: defaultPageSizeOptions,
                            currentPage,
                            pageSize: view.pageSize,
                            setNewPageSize,
                            setNewPage,
                            totalItems: data?.totalCount ?? 0
                        }}
                        itemActions={[editAction, deactivateAction, ...(itemActions ?? emptyArray)].filter(Boolean)}
                    />
                )}
            </ExplorerPageDivStyled>
            {panelElement && createPortal(<SidePanel />, panelElement)}
            {editModal}
            {createModal}
        </ViewSettingsContext.Provider>
    );
};
