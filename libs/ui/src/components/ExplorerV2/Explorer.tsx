import {forwardRef, type ReactNode, useId, useImperativeHandle, useMemo} from 'react';
import {KitEmpty, KitSnackBarProvider, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {Loading} from '_ui/components/Loading';
import {type ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {useControlledFilterStore} from '_ui/components/Filters/useControlledFilterStore';
import {FiltersContext} from '_ui/components/Filters/context/filtersContext';
import {type UIFilter} from '_ui/components/Filters/_types';
import {type JoinLibraryContextFragment, ViewV2Types} from '_ui/_gqlTypes';
import {
    type Entrypoint,
    type IItemAction,
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

const isNotEmpty = <T extends unknown[]>(union: T): union is Exclude<T, []> => union.length > 0;

const emptyArray = [];
const emptyObject = {};

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
                sort: currentView?.sort ?? [],
                shortcuts: currentView?.shortcuts ?? DEFAULT_VIEW_SHORTCUTS,
            }),
            [ephemeralView, currentView],
        );

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

        const onFiltersChange = defaultCallbacks?.viewSettings?.onFiltersChange;
        const handleFiltersChange = useMemo(
            () => (onFiltersChange ? (filters: SerializedFilter[]) => onFiltersChange({filters}) : undefined),
            [onFiltersChange],
        );

        const {filtersData, dispatch: filtersDispatch} = useControlledFilterStore({
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

        const {
            data,
            isMultivalue,
            canEditLinkAttributeValues,
            loading: loadingData,
            refetch,
        } = useExplorerData({
            entrypoint,
            libraryId: view.libraryId,
            attributeIds: view.attributesIds,
            fulltextSearch: view.fulltextSearch,
            pagination: noPagination ? null : {limit: view.pageSize, offset: view.pageSize * (currentPage - 1)},
            sorts: view.sort,
            filters: requestFilters,
            filtersOperator,
            skip: !isViewReady,
        }); // TODO: refresh when go back on page
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

        const totalCountFiltered = data?.totalCount ?? 0;

        const {countData: totalCountLibrary, refetchCount} = useExplorerCountData({
            entrypoint,
            libraryId: view.libraryId,
            defaultFilters: hiddenFilters,
            filters: requestFilters,
            skip: !isViewReady,
        });

        const hasNoResults = data === null || data.totalCount === 0;

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

        const allVisibleKeys = data?.records.map(({key}) => key) ?? [];

        const {generatePreviewsMassAction, GeneratePreviewsModal} = useGeneratePreviewsMassAction({
            isEnabled: !isLink && isNotEmpty(defaultMassActions) && defaultMassActions.includes('generatePreviews'),
            store: {view},
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
                totalCountFiltered > 0 &&
                !_isSelectionDisable &&
                (isNotEmpty(defaultMassActions) || isNotEmpty(massActions) || !!defaultCallbacks?.item?.select),
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

        const handleSortClick =
            canManageViewSettings && view.viewId
                ? () =>
                      defaultCallbacks?.viewSettings?.onViewSettingsShortcutClick?.({
                          settingName: 'sorts',
                          viewId: view.viewId!,
                      })
                : undefined;

        const {viewSettingsShortcutsButtons} = useOpenViewSettingsV2({
            isEnabled: canManageViewSettings,
            view,
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
                        showSorts={showSorts}
                        isMassSelectionAll={isMassSelectionAll}
                        headless={hideTableHeader}
                        canRemoveFilters={canManageViewSettings}
                        selectAllButton={hideSelectAllAction ? null : selectAllButton}
                        viewSettingsLoading={viewSettingsLoading}
                        onSortClick={handleSortClick}
                    >
                        {showSearch ? searchInput : null}
                        {viewSettingsShortcutsButtons}
                        {hidePrimaryActions ? null : primaryButton}
                    </ExplorerToolbar>
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
                            attributesToDisplay={
                                /* ⚠️ whoAmI column will always be displayed first*/ view.attributesIds
                            }
                            hideTableHeader={hideTableHeader}
                            useSmallHeaderSize={useSmallHeaderSize}
                            paginationProps={
                                entrypoint.type === 'library' && !noPagination
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
                                    ? data?.records.map(({whoAmI}) => whoAmI.id)
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
                    future iframe panels behave identically. The toolbar + filters tab read this context. */}
                <FiltersContext.Provider value={{filtersData, dispatch: filtersDispatch}}>
                    {explorerBody}
                </FiltersContext.Provider>
                <KitSnackBarProvider id={massActionSnackbarId} />
            </>
        );
    },
);
