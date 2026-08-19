import {forwardRef, type ReactNode, useId, useImperativeHandle, useMemo} from 'react';
import {KitEmpty, KitSnackBarProvider, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useDelayedLoading} from '_ui/hooks/useDelayedLoading';
import {useStickyValue} from '_ui/hooks/useStickyValue';
import {Loading} from '_ui/components/Loading';
import {type ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {useControlledFilterStore} from '_ui/components/Filters/useControlledFilterStore';
import {FiltersContext} from '_ui/components/Filters/context/filtersContext';
import {prepareFiltersForRequest} from '_ui/components/Filters';
import {type UIFilter} from '_ui/components/Filters/_types';
import {type JoinLibraryContextFragment, ViewV2Types} from '_ui/_gqlTypes';
import {
    type Entrypoint,
    type IItemAction,
    type IKanbanDataSource,
    type IMassActions,
    type IPrimaryAction,
    isHiddenFullFilter,
    type SerializedFilter,
    type SerializedView,
    type ViewSettingsShortcuts,
} from './_types';
import {useExplorerData} from './_queries/useExplorerData';
import {DataView} from './DataView';
import {ExplorerTitle} from './ExplorerTitle';
import {ExplorerToolbar} from './ExplorerToolbar';
import {useEditStatusItemAction} from './actions-item/useEditStatusItemAction';
import {useReplaceItemAction} from './actions-item/useReplaceItemAction';
import {usePrimaryActionsButton} from './actions-primary/usePrimaryActions';
import {useCreatePrimaryAction} from './actions-primary/useCreatePrimaryAction';
import {useLinkPrimaryAction} from './actions-primary/useLinkPrimaryAction';
import {useMassActions} from './actions-mass/useMassActions';
import {useDeactivateMassAction} from './actions-mass/useDeactivateMassAction';
import {useDeleteLinkValues} from './actions-mass/useDeleteLinkValues';
import {useExportMassAction} from './actions-mass/useExportMassAction';
import {useEditAttributeMassAction} from './actions-mass/useEditAttributeMassAction';
import {useGeneratePreviewsMassAction} from './actions-mass/useGeneratePreviewsMassAction';
import {
    DEFAULT_VIEW_SHORTCUTS,
    defaultPageSizeOptions,
    type IViewSettingsState,
    useOpenViewSettingsV2,
    ViewSettingsContext,
} from './manage-view-settings-v2';
import {useSearchInput} from './useSearchInput';
import {usePagination} from './usePagination';
import {useViewSettingsReducer} from './useViewSettingsReducer';
import {MASS_SELECTION_ALL, SNACKBAR_MASS_ID} from './_constants';
import {useExplorerCountData} from './_queries/useExplorerCountData';
import {useExplorerLibraryMetadata} from './_queries/useExplorerLibraryMetadata';
import {getLibraryRequestValuesList} from './_queries/getLibraryRequestValuesList';
import {useKanbanColumnsData} from './kanban/useKanbanColumnsData';

const isNotEmpty = <T extends unknown[]>(union: T): union is Exclude<T, []> => union.length > 0;

const emptyArray = [];

const ExplorerHeaderDivStyled = styled.div`
    display: flex;
    align-items: flex-start;
    padding: calc(var(--general-spacing-xs) * 1px);
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

export interface IExplorerProps {
    entrypoint: Entrypoint;
    noPagination?: true;
    itemActions?: IItemAction[];
    primaryActions?: IPrimaryAction[];
    massActions?: IMassActions[];
    title?: string;
    selectionMode?: 'multiple' | 'simple';
    emptyPlaceholder?: ReactNode;
    defaultActionsForItem?: Array<'replaceLink' | 'remove' | 'activate'>;
    defaultPrimaryActions?: Array<'create'>;
    defaultMassActions?: Array<'deactivate' | 'export' | 'editAttribute' | 'generatePreviews'>;
    defaultCallbacks?: {
        item?: {
            edit?: IItemAction['callback'];
            replaceLink?: (replaceValuesResult: ISubmitMultipleResult) => void;
            remove?: IItemAction['callback'];
            select?: IItemAction['callback'];
        };
        primary?: {
            create?: ({
                recordIdCreated,
                saveValuesResultOnLink,
            }: {
                recordIdCreated: string;
                saveValuesResultOnLink?: ISubmitMultipleResult;
            }) => void;
            link?: (saveValuesResult: ISubmitMultipleResult) => void;
        };
        mass?: {
            deactivate?: IMassActions['callback'];
            export?: IMassActions['callback'];
            generatePreviews?: IMassActions['callback'];
        };
        viewSettings?: {
            onViewSettingsShortcutClick?: ({
                settingName,
                viewId,
            }: {
                settingName: ViewSettingsShortcuts;
                viewId: string;
            }) => void;
            closeViewSettings?: () => void;
            /**
             * Called (echo-suppressed) whenever the user edits OR removes a filter from the toolbar. The
             * payload carries the WHOLE lean user-filter set (covers removal too — `canRemoveFilters`),
             * so the host (app-studio) reconciles it against the current-view store: update present
             * filters, unpin those absent. Filters are part of the controlled view (ADR-006 / LEAVC-810).
             */
            onFiltersChange?: (payload: {filters: SerializedFilter[]}) => void;
        };
    };
    showCreateOnNoResultOnly?: boolean;
    showFilters?: boolean;
    showSorts?: boolean;
    hideFirstActionLabel?: boolean;
    /**
     * Optional to `false` load the last added view when `props.defaultViewSettings.viewId` is `undefined`,
     * if set to `true` load default view.
     */
    ignoreViewByDefault?: boolean;
    showTitle?: boolean;
    showSearch?: boolean;
    disableSelection?: boolean;
    hideSelectAllAction?: boolean;
    hidePrimaryActions?: boolean;
    hideTableHeader?: boolean;
    useSmallHeaderSize?: boolean;
    tableBodyHeight?: string;
    creationFormId?: string;
    joinLibraryContext?: JoinLibraryContextFragment;
    /**
     * Controlled view config (viewType/attributesIds/sort/shortcuts/viewId **and** filters). app-studio
     * is the source of truth and feeds this prop; ExplorerV2 never fetches a viewV2 itself and data
     * queries stay skipped until it is received. `filters` carries the lean USER filters (seeded into the
     * internal store) plus any masked `hidden` pre-filter (merged straight into the request). Edits flow
     * back via `defaultCallbacks.viewSettings.onFiltersChange` (ADR-006 / LEAVC-810).
     */
    currentView?: SerializedView;
    /**
     * Host-controlled loading flag: the host is still resolving WHICH view to show (or its content) and
     * hasn't sent the real `currentView` yet. Renders the loader instead of the default (list) view, so a
     * kanban (or any non-list) view never flashes a table first. Purely additive — omitted (uncontrolled)
     * consumers keep rendering their default view immediately.
     */
    isViewLoading?: boolean;
}

export interface IExplorerRef {
    createAction: IPrimaryAction | null;
    linkAction: IPrimaryAction | null;
    totalCount: number;
}

/**
 * `Explorer` from ExplorerV2 directory is the new version that will uses the `ViewV2` API.
 * It is a temporary version to allow a smooth migration that should be removed once all development related to ViewV2 will be done.
 */
export const ExplorerV2 = forwardRef<IExplorerRef, IExplorerProps>(
    (
        {
            entrypoint,
            itemActions = [],
            primaryActions = [],
            massActions = [],
            title,
            selectionMode = 'multiple',
            emptyPlaceholder,
            noPagination,
            creationFormId,
            showCreateOnNoResultOnly = false,
            showFilters = false,
            showSorts = false,
            hideFirstActionLabel = false,
            disableSelection = false,
            hideSelectAllAction = false,
            showTitle = false,
            showSearch = false,
            hidePrimaryActions = false,
            hideTableHeader = false,
            useSmallHeaderSize = false,
            tableBodyHeight,
            defaultActionsForItem = ['replaceLink', 'remove', 'activate'],
            defaultPrimaryActions = ['create'],
            defaultMassActions = ['deactivate', 'editAttribute', 'export', 'generatePreviews'],
            defaultCallbacks,
            joinLibraryContext,
            currentView,
            isViewLoading,
        },
        ref,
    ) => {
        const {t} = useSharedTranslation();

        const {
            loading: viewSettingsLoading,
            view: ephemeralView,
            dispatch: viewSettingsDispatch,
        } = useViewSettingsReducer(entrypoint);

        /**
         * The display config (viewType/attributesIds/sort/viewId) is owned by the controlled
         * `currentView` prop and merged on top of the ephemeral state (mass selection, page size,
         * fulltext search) + the async-resolved `libraryId`/`entrypoint`.
         */
        const view: IViewSettingsState = useMemo(
            () => ({
                ...ephemeralView,
                viewId: currentView?.viewId ?? null,
                viewLabels: currentView?.viewLabels ?? {},
                viewType: currentView?.viewType ?? ViewV2Types.list,
                attributesIds: currentView?.attributesIds ?? [],
                groupByAttributeId: currentView?.groupByAttributeId,
                sort: currentView?.sort ?? [],
                shortcuts: currentView?.shortcuts ?? DEFAULT_VIEW_SHORTCUTS,
            }),
            [ephemeralView, currentView],
        );

        const {
            attributesProperties,
            behavior: libraryBehavior,
            loading: metadataLoading,
        } = useExplorerLibraryMetadata({libraryId: view.libraryId});

        const isViewReady = currentView !== undefined && !viewSettingsLoading;

        /**
         * Filters travel through the controlled view (ADR-006 / LEAVC-810). ExplorerV2 ALWAYS owns its own
         * internal filter store (via `useControlledFilterStore`), seeded from `currentView.filters` (the
         * lean USER filters) and writing edits/removals back to the host through `onFiltersChange`
         * (echo-suppressed). No more ambient-context detection — native and (future) iframe panels behave
         * identically. Masked `hidden` pre-filters bypass the store entirely (kept full, merged into the
         * request, never shown).
         */
        const allFilters = currentView?.filters ?? emptyArray;
        const hiddenFilters = useMemo<UIFilter[]>(() => allFilters.filter(isHiddenFullFilter), [allFilters]);
        const userLeanFilters = useMemo(
            () => allFilters.filter((filter): filter is SerializedFilter => !isHiddenFullFilter(filter)),
            [allFilters],
        );

        // An unpinned filter still applies to the request (see `requestFilters` below) but must not show as
        // a toolbar chip — `UIFilter`/the filter store carry no `pinned` field, so this id set is computed
        // straight from the lean source and threaded down to `ExplorerFilters` for display filtering.
        const pinnedFilterIds = useMemo(
            () =>
                new Set(
                    userLeanFilters
                        .filter(filter => filter.pinned)
                        .map(filter => filter.attributes.map(attribute => attribute.id).join('/')),
                ),
            [userLeanFilters],
        );

        // A filter merely made "available" by the admin gear (SET_AVAILABLE_FILTERS) is seeded with
        // an empty condition and no `withEmptyValues` — it must not count as "active" (shortcut
        // button + green dot), pinned or not, until it actually carries a value.
        const hasActiveFilters = useMemo(
            () => userLeanFilters.some(filter => filter.values.length > 0 || Boolean(filter.withEmptyValues)),
            [userLeanFilters],
        );

        const onFiltersChange = defaultCallbacks?.viewSettings?.onFiltersChange;
        const handleFiltersChange = useMemo(
            () => (onFiltersChange ? (filters: SerializedFilter[]) => onFiltersChange({filters}) : undefined),
            [onFiltersChange],
        );

        const {
            filtersData,
            dispatch: filtersDispatch,
            isSeeded: isFiltersSeeded,
        } = useControlledFilterStore({
            leanFilters: userLeanFilters,
            libraryId: view.libraryId,
            viewId: view.viewId,
            onChange: handleFiltersChange,
        });

        const storeFilters = filtersData?.filters ?? emptyArray;
        const filtersOperator = currentView?.filtersOperator ?? 'AND';

        // The records request is the masked (hidden) pre-filters prepended to the editable store filters.
        const requestFilters = useMemo<UIFilter[]>(
            () => [...hiddenFilters, ...storeFilters],
            [hiddenFilters, storeFilters],
        );
        const filtersStore = useMemo(() => ({...filtersData, filters: requestFilters}), [filtersData, requestFilters]);

        const {currentPage, setNewPageSize, setNewPage} = usePagination(viewSettingsDispatch);

        const isKanban = view.viewType === ViewV2Types.kanban;
        // On a library entrypoint the kanban loads its records itself, column by column (per-column
        // pagination): the global data/count queries are skipped and it receives a data source instead.
        // The link entrypoint keeps the global-set fallback (its query has no filters/pagination).
        const isPerColumnKanban = isKanban && entrypoint.type === 'library';

        // The grouping axis must be fetched even when it is a hidden column, otherwise cards could not be
        // distributed into columns. It is appended to the queried attributes without becoming a displayed
        // table column (attributesToDisplay stays view.attributesIds).
        const queryAttributeIds = useMemo(
            () =>
                view.groupByAttributeId && !view.attributesIds.includes(view.groupByAttributeId)
                    ? [...view.attributesIds, view.groupByAttributeId]
                    : view.attributesIds,
            [view.attributesIds, view.groupByAttributeId],
        );

        const {
            countData: rawTotalCountLibrary,
            loading: countLoading,
            refetchCount,
        } = useExplorerCountData({
            entrypoint,
            libraryId: view.libraryId,
            defaultFilters: hiddenFilters,
            filters: requestFilters,
            // Kept alive on the per-column kanban path: the count is grouping-independent (library
            // total) and feeds the "X / Y" results count next to the mass-selection checkbox.
            // `!isFiltersSeeded`: the internal filter store starts empty and only adopts `requestFilters`
            // one render after `currentView.filters` changes (see `useControlledFilterStore`'s `isSeeded`)
            // — without this, the FIRST request after a view/filter change would fire against a stale/
            // empty filter set, immediately superseded by a second, correct one.
            skip: !isViewReady || !isFiltersSeeded,
        });
        const totalCountLibrary = useStickyValue(rawTotalCountLibrary, countLoading);

        const {
            data,
            isMultivalue,
            canEditLinkAttributeValues,
            loading: loadingData,
            refetch,
        } = useExplorerData({
            entrypoint,
            libraryId: view.libraryId,
            attributeIds: queryAttributeIds,
            fulltextSearch: view.fulltextSearch,
            pagination: noPagination ? null : {limit: view.pageSize, offset: view.pageSize * (currentPage - 1)},
            sorts: view.sort,
            filters: requestFilters,
            filtersOperator,
            skip: !isViewReady || !isFiltersSeeded || isPerColumnKanban,
            refetchCount,
        }); // TODO: refresh when go back on page

        const kanbanDataSource = useMemo<IKanbanDataSource | undefined>(
            () =>
                isPerColumnKanban && isViewReady && isFiltersSeeded
                    ? {
                          libraryId: view.libraryId,
                          attributeIds: queryAttributeIds,
                          filters: prepareFiltersForRequest(
                              requestFilters,
                              filtersOperator,
                              getLibraryRequestValuesList(entrypoint, view.fulltextSearch),
                          ),
                          searchQuery: view.fulltextSearch,
                          sorts: view.sort,
                      }
                    : undefined,
            [
                isPerColumnKanban,
                isViewReady,
                isFiltersSeeded,
                view.libraryId,
                queryAttributeIds,
                requestFilters,
                filtersOperator,
                entrypoint,
                view.fulltextSearch,
                view.sort,
            ],
        );
        // The per-column kanban owns its data (listDistinctValues counts + one card page per column). It is
        // loaded HERE, not inside KanbanView, so the aggregate count and the loaded card keys feed the
        // same wiring as the list view — ref.totalCount, mass selection ("select all"), results count.
        // KanbanView becomes a pure renderer of the columns it receives. Off the per-column path the hook
        // is disabled (kanbanDataSource undefined → empty state) and the link fallback keeps its global set.
        const kanbanColumnsData = useKanbanColumnsData({
            dataSource: kanbanDataSource,
            axisAttributeId: view.groupByAttributeId,
        });

        // V1 kanban trees are flat: every record lands in exactly one column (a node bucket or the
        // no-value one), so the sum of the column counts is the filtered total, and the union of every
        // column's loaded cards is the set of visible keys. Both are frozen while the board reloads
        // (reset → fresh counts, or column pages in flight): a filter/search/sort change empties
        // columnStatesById synchronously, and without the freeze the results count and the
        // mass-selection checkbox would flicker to 0/disabled on every interaction (same LEAVC-587
        // pattern as listTotalCountFiltered below).
        const isKanbanBoardReloading =
            kanbanColumnsData.isReloading ||
            Object.values(kanbanColumnsData.columnStatesById).some(({isLoadingMore}) => isLoadingMore);
        const kanbanTotalCount = useStickyValue(
            useMemo(
                () => Object.values(kanbanColumnsData.columnStatesById).reduce((total, {count}) => total + count, 0),
                [kanbanColumnsData.columnStatesById],
            ),
            isKanbanBoardReloading,
        );
        const kanbanVisibleKeys = useStickyValue(
            useMemo(
                () => Object.values(kanbanColumnsData.columnStatesById).flatMap(({cards}) => cards.map(({key}) => key)),
                [kanbanColumnsData.columnStatesById],
            ),
            isKanbanBoardReloading,
        );

        const isMassSelectionAll = view.massSelection === MASS_SELECTION_ALL;
        const isLink = entrypoint.type === 'link';

        const {editStatusItemAction} = useEditStatusItemAction({
            isEnabled:
                isNotEmpty(defaultActionsForItem) &&
                (defaultActionsForItem.includes('remove') || defaultActionsForItem.includes('activate')),
            onRemove: defaultCallbacks?.item?.remove,
            canDeleteLinkValues: canEditLinkAttributeValues,
            store: {view, dispatch: viewSettingsDispatch},
            entrypoint,
        });

        const {replaceItemAction, replaceItemModal} = useReplaceItemAction({
            isEnabled: isLink && isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('replaceLink'),
            isMultivalue,
            onReplace: defaultCallbacks?.item?.replaceLink,
            canReplaceLinkValues: canEditLinkAttributeValues,
            columnsToDisplay: !joinLibraryContext ? view.attributesIds : [],
        });

        const listTotalCountFiltered = useStickyValue(data?.totalCount ?? 0, loadingData);
        // On the per-column kanban the records query is skipped, so the filtered total comes from the
        // summed column counts instead of `data.totalCount`.
        const totalCountFiltered = isPerColumnKanban ? kanbanTotalCount : listTotalCountFiltered;

        // On the per-column kanban path the board owns its data: an empty board renders its empty
        // columns, never the global "no data" placeholder.
        const hasNoResults = !isPerColumnKanban && (data === null || data.totalCount === 0);

        // Loader states, delayed so a fast request never flashes a spinner:
        // - `viewSettingsLoading` / `loadingData`: the explorer's own bootstrap + records query;
        // - `metadataLoading`: the library/attributes metadata query — records and metadata now arrive
        //   through two separate requests; without this gate, a window where records have arrived but
        //   attributes haven't yet would make TableView dereference `attributesProperties[id].label` on
        //   an undefined entry. It also lets the kanban skip its own loading flag (see KanbanView).
        // - `isViewLoading`: the host is still resolving WHICH view to show and hasn't sent the real
        //   `currentView` yet — without this the explorer would paint its default (list) view and flash a
        //   table before a kanban (or any non-list) view arrives. Omitted by uncontrolled consumers → they
        //   keep rendering immediately (no behaviour change).
        // - `isViewReady && !isFiltersSeeded`: the records/count queries are skipped during this window
        //   (see above), so `loadingData` alone reads `false` here — without folding it in, the explorer
        //   would briefly read `hasNoResults` (data === null) and flash the empty placeholder instead of
        //   staying on the loader through the hand-off from "view ready" to "filters seeded".
        const isExplorerLoading =
            loadingData ||
            viewSettingsLoading ||
            metadataLoading ||
            Boolean(isViewLoading) ||
            (isViewReady && !isFiltersSeeded);
        const isLoaderVisible = useDelayedLoading(isExplorerLoading);

        const isAllowedFreeEntry = !(entrypoint.type === 'library' && !entrypoint.allowFreeEntry);

        const showCreatePrimaryButton = showCreateOnNoResultOnly
            ? !hidePrimaryActions && !loadingData && hasNoResults && isAllowedFreeEntry
            : true;

        const {createPrimaryAction, createModal} = useCreatePrimaryAction({
            isEnabled: isNotEmpty(defaultPrimaryActions) && defaultPrimaryActions.includes('create'),
            isVisible: showCreatePrimaryButton,
            libraryId: view.libraryId,
            canCreateAndLinkValue: canEditLinkAttributeValues,
            onCreate: defaultCallbacks?.primary?.create,
            joinLibraryContext,
            entrypoint,
            isMultivalue,
            totalCount: totalCountFiltered,
            formId: creationFormId,
            refetch,
            refetchCount,
        });
        const {linkPrimaryAction, linkModal} = useLinkPrimaryAction({
            isEnabled: isLink,
            joinLibraryContext,
            isVisible: showCreatePrimaryButton,
            canAddLinkValue: canEditLinkAttributeValues,
            onLink: defaultCallbacks?.primary?.link,
            linkId: data?.totalCount === 0 ? undefined : data?.records[0]?.id_value,
            isMultivalue,
            maxItemsLeft: null, // TODO: use KitTable.row,
            columnsToDisplay: !joinLibraryContext ? view.attributesIds : [],
        });

        const allVisibleKeys = isPerColumnKanban ? kanbanVisibleKeys : (data?.records.map(({key}) => key) ?? []);

        const {generatePreviewsMassAction, GeneratePreviewsModal} = useGeneratePreviewsMassAction({
            isEnabled: !isLink && isNotEmpty(defaultMassActions) && defaultMassActions.includes('generatePreviews'),
            store: {view},
            libraryBehavior,
            totalCount: totalCountFiltered,
            onGeneratePreviews: defaultCallbacks?.mass?.generatePreviews,
        });

        const {exportMassAction, ExportModal} = useExportMassAction({
            isEnabled: !isLink && isNotEmpty(defaultMassActions) && defaultMassActions.includes('export'),
            store: {view, dispatch: viewSettingsDispatch},
            totalCount: totalCountFiltered,
            onExport: defaultCallbacks?.mass?.export,
        });

        const {editAttributeMassAction, editAttributeMassActionModal} = useEditAttributeMassAction({
            isEnabled: !isLink && isNotEmpty(defaultMassActions) && defaultMassActions.includes('editAttribute'),
            store: {view},
            attributesProperties,
            totalCount: totalCountFiltered,
        });

        const {deactivateMassAction} = useDeactivateMassAction({
            isEnabled: !isLink && isNotEmpty(defaultMassActions) && defaultMassActions.includes('deactivate'),
            store: {view, dispatch: viewSettingsDispatch},
            allVisibleKeys,
            totalCount: totalCountFiltered,
            onDeactivate: defaultCallbacks?.mass?.deactivate,
            refetch,
        });

        const {unlinkMassAction} = useDeleteLinkValues({
            isEnabled: isLink && isNotEmpty(defaultMassActions) && defaultMassActions.includes('deactivate'),
            store: {view, dispatch: viewSettingsDispatch},
            filtersStore,
            pagination: noPagination ? null : {limit: view.pageSize, offset: view.pageSize * (currentPage - 1)},
            allVisibleKeys,
            onDelete: defaultCallbacks?.mass?.deactivate,
            refetch,
        });

        const _isSelectionDisable = disableSelection || (isLink && !isMultivalue && totalCountFiltered > 0);

        const generatedId = useId().replace(/:/g, '');
        const massActionSnackbarId = `${SNACKBAR_MASS_ID}_${generatedId}`;

        const {setSelectedKeys, selectAllButton} = useMassActions({
            isEnabled:
                !_isSelectionDisable &&
                (isNotEmpty(defaultMassActions) || isNotEmpty(massActions) || !!defaultCallbacks?.item?.select),
            loading: loadingData,
            store: {view, dispatch: viewSettingsDispatch},
            filtersStore,
            totalCountFiltered,
            totalCountLibrary,
            allVisibleKeys,
            massActions: [
                generatePreviewsMassAction,
                exportMassAction,
                editAttributeMassAction,
                deactivateMassAction,
                unlinkMassAction,
                ...massActions,
            ].filter(Boolean),
            snackbarId: massActionSnackbarId,
        });

        const {primaryButton} = usePrimaryActionsButton({
            view,
            actions: [createPrimaryAction, linkPrimaryAction, ...primaryActions].filter(Boolean),
            hideFirstActionLabel,
        });

        /**
         * The view settings panel lives in app-studio (ADR-006): the shortcuts are enabled only
         * when the host provides `onViewSettingsShortcutClick`. The same flag controls whether
         * the toolbar exposes filter removal (`canRemoveFilters`).
         */
        const canManageViewSettings = defaultCallbacks?.viewSettings?.onViewSettingsShortcutClick !== undefined;

        const {viewSettingsShortcutsButtons} = useOpenViewSettingsV2({
            isEnabled: canManageViewSettings,
            view,
            showFilters,
            showSorts,
            hasActiveFilters,
            open: !isMassSelectionAll,
            closeViewSettings: defaultCallbacks?.viewSettings?.closeViewSettings,
            onViewSettingsShortcutClick: defaultCallbacks?.viewSettings?.onViewSettingsShortcutClick,
        });

        const {searchInput} = useSearchInput({view, dispatch: viewSettingsDispatch, setNewPage});

        useImperativeHandle(
            ref,
            () => ({
                createAction: createPrimaryAction,
                linkAction: linkPrimaryAction,
                totalCount: totalCountFiltered,
            }),
            [createPrimaryAction?.disabled, linkPrimaryAction?.disabled, totalCountFiltered],
        );

        const explorerBody = (
            <ViewSettingsContext.Provider value={{view, dispatch: viewSettingsDispatch}}>
                <ExplorerPageDivStyled>
                    {showTitle && (
                        <ExplorerHeaderDivStyled>
                            <KitTypography.Title level="h3">
                                {
                                    !viewSettingsLoading && (
                                        <ExplorerTitle library={view.libraryId} title={title} entrypoint={entrypoint} />
                                    ) /*TODO: manage loading*/
                                }
                            </KitTypography.Title>
                        </ExplorerHeaderDivStyled>
                    )}
                    <ExplorerToolbar
                        showFilters={showFilters}
                        pinnedFilterIds={pinnedFilterIds}
                        isMassSelectionAll={isMassSelectionAll}
                        headless={hideTableHeader}
                        canRemoveFilters={canManageViewSettings}
                        selectAllButton={hideSelectAllAction ? null : selectAllButton}
                        viewSettingsLoading={viewSettingsLoading}
                    >
                        {showSearch ? searchInput : null}
                        {viewSettingsShortcutsButtons}
                        {hidePrimaryActions ? null : primaryButton}
                    </ExplorerToolbar>
                    {isLoaderVisible ? (
                        <Loading />
                    ) : isExplorerLoading ? null : hasNoResults ? (
                        <ExplorerEmptyDataStyled>
                            {emptyPlaceholder || <KitEmpty title={t('explorer.empty-data')} />}
                        </ExplorerEmptyDataStyled>
                    ) : (
                        <DataView
                            viewType={view.viewType}
                            groupByAttributeId={view.groupByAttributeId}
                            kanbanColumns={isPerColumnKanban ? kanbanColumnsData : undefined}
                            dataGroupedFilteredSorted={data?.records ?? emptyArray}
                            attributesProperties={attributesProperties}
                            attributesToDisplay={
                                /* ⚠️ whoAmI column will always be displayed first*/ view.attributesIds
                            }
                            hideTableHeader={hideTableHeader}
                            useSmallHeaderSize={useSmallHeaderSize}
                            paginationProps={
                                entrypoint.type === 'library' && !noPagination && !isKanban
                                    ? {
                                          pageSizeOptions: defaultPageSizeOptions,
                                          currentPage,
                                          pageSize: view.pageSize,
                                          setNewPageSize,
                                          setNewPage,
                                          totalCount: totalCountFiltered,
                                      }
                                    : undefined
                            }
                            itemActions={[...itemActions, replaceItemAction, editStatusItemAction]
                                .filter(Boolean)
                                .map(action => ({
                                    ...action,
                                    disabled: isMassSelectionAll || action.disabled,
                                }))}
                            selection={{
                                onSelectItem: _isSelectionDisable ? null : defaultCallbacks?.item?.select,
                                onSelectionChange: _isSelectionDisable ? null : setSelectedKeys,
                                isMassSelectionAll,
                                selectedKeys: isMassSelectionAll
                                    ? isPerColumnKanban
                                        ? kanbanVisibleKeys
                                        : data?.records.map(({whoAmI}) => whoAmI.id)
                                    : (view.massSelection as string[]),
                                mode: selectionMode,
                            }}
                            tableBodyHeight={tableBodyHeight}
                        />
                    )}
                </ExplorerPageDivStyled>
                {replaceItemModal}
                {createModal}
                {linkModal}
                {editAttributeMassActionModal}
                {ExportModal}
                {GeneratePreviewsModal}
            </ViewSettingsContext.Provider>
        );

        return (
            <>
                {/* ExplorerV2 ALWAYS provides its own filter store (no ambient detection): native and
                    future iframe panels behave identically. The toolbar + filters tab read this context.
                    `filtersStore` (hidden + editable filters merged) is exposed rather than the raw store
                    so query-driving consumers (e.g. smart filter dropdowns) see the same masked scoping
                    as the records request. */}
                <FiltersContext.Provider value={{filtersData: filtersStore, dispatch: filtersDispatch}}>
                    {explorerBody}
                </FiltersContext.Provider>
                <KitSnackBarProvider id={massActionSnackbarId} />
            </>
        );
    },
);
