// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {forwardRef, type ReactNode, useImperativeHandle, useMemo} from 'react';
import {createPortal} from 'react-dom';
import {KitEmpty, KitSnackBarProvider, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {Loading} from '_ui/components/Loading';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {
    type DefaultViewSettings,
    type Entrypoint,
    type IItemAction,
    type IMassActions,
    type IPrimaryAction,
} from './_types';
import {useExplorerData} from './_queries/useExplorerData';
import {DataView} from './DataView';
import {ExplorerTitle} from './ExplorerTitle';
import {ExplorerToolbar} from './ExplorerToolbar';
import {useEditStatusItemAction} from './actions-item/useEditStatusItemAction';
import {usePrimaryActionsButton} from './actions-primary/usePrimaryActions';
import {useCreatePrimaryAction} from './actions-primary/useCreatePrimaryAction';
import {useLinkPrimaryAction} from './actions-primary/useLinkPrimaryAction';
import {useMassActions} from './actions-mass/useMassActions';
import {useDeactivateMassAction} from './actions-mass/useDeactivateMassAction';
import {
    defaultPageSizeOptions,
    SidePanel,
    useEditSettings,
    useOpenViewSettings,
    ViewSettingsContext,
} from './manage-view-settings';
import {useSearchInput} from './useSearchInput';
import {usePagination} from './usePagination';
import {useViewSettingsReducer} from './useViewSettingsReducer';
import {MASS_SELECTION_ALL, SNACKBAR_MASS_ID, WHO_AM_I_COLUMN} from './_constants';
import {useDeleteLinkValues} from './actions-mass/useDeleteLinkValues';
import {useReplaceItemAction} from './actions-item/useReplaceItemAction';
import {type JoinLibraryContextFragment} from '_ui/_gqlTypes';
import {useFiltersReducer} from '_ui/components/Filters/context/useFiltersReducer';
import {FiltersContext} from '_ui/components/Filters/context/filtersContext';
import {useExportMassAction} from './actions-mass/useExportMassAction';
import {useEditAttributeMassAction} from './actions-mass/useEditAttributeMassAction';

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
    defaultMassActions?: Array<'deactivate' | 'export' | 'editAttribute'>;
    defaultViewSettings?: DefaultViewSettings;
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
    creationFormId?: string;
    joinLibraryContext?: JoinLibraryContextFragment;
}

export interface IExplorerRef {
    createAction: IPrimaryAction | null;
    linkAction: IPrimaryAction | null;
    totalCount: number;
}

export const Explorer = forwardRef<IExplorerRef, IExplorerProps>(
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
            ignoreViewByDefault = false,
            defaultActionsForItem = ['replaceLink', 'remove', 'activate'],
            defaultPrimaryActions = ['create'],
            defaultMassActions = ['deactivate', 'editAttribute'],
            defaultCallbacks,
            defaultViewSettings,
            joinLibraryContext,
        },
        ref,
    ) => {
        const {t} = useSharedTranslation();

        const {panelElement: settingsPanelElement} = useEditSettings();

        const {
            loading: viewSettingsLoading,
            view,
            dispatch: viewSettingsDispatch,
        } = useViewSettingsReducer(entrypoint, defaultViewSettings, ignoreViewByDefault);

        const {filtersData, dispatch: filtersDispatch} = useFiltersReducer({
            libraryId: view.libraryId,
            viewId: view.viewId ?? undefined,
            filters: defaultViewSettings?.filters ?? undefined,
            filtersOperator: defaultViewSettings?.filtersOperator ?? undefined,
            ignoreViewByDefault,
            skip: viewSettingsLoading,
        });

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
            filters: filtersData.filters,
            filtersOperator: filtersData.filtersOperator,
            skip: viewSettingsLoading,
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
        });

        const totalCount = data?.totalCount ?? 0;

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
            totalCount,
            formId: creationFormId,
            refetch,
        });
        const {linkPrimaryAction, linkModal} = useLinkPrimaryAction({
            isEnabled: isLink,
            joinLibraryContext,
            isVisible: showCreatePrimaryButton,
            canAddLinkValue: canEditLinkAttributeValues,
            onLink: defaultCallbacks?.primary?.link,
            linkId: data?.totalCount === 0 ? undefined : data?.records[0]?.id_value,
            isMultivalue,
            maxItemsLeft: null, // TODO: use KitTable.row
        });

        const allVisibleKeys = data?.records.map(({key}) => key) ?? [];

        const {exportMassAction} = useExportMassAction({
            isEnabled: !isLink && isNotEmpty(defaultMassActions) && defaultMassActions.includes('export'),
            store: {view, dispatch: viewSettingsDispatch},
            totalCount,
            onExport: defaultCallbacks?.mass?.export,
        });

        const {editAttributeMassAction, editAttributeMassActionModal} = useEditAttributeMassAction({
            isEnabled: !isLink && isNotEmpty(defaultMassActions) && defaultMassActions.includes('editAttribute'),
            store: {view},
            totalCount,
        });

        const {deactivateMassAction} = useDeactivateMassAction({
            isEnabled: !isLink && isNotEmpty(defaultMassActions) && defaultMassActions.includes('deactivate'),
            store: {view, dispatch: viewSettingsDispatch},
            allVisibleKeys,
            totalCount,
            onDeactivate: defaultCallbacks?.mass?.deactivate,
            refetch,
        });

        const {unlinkMassAction} = useDeleteLinkValues({
            isEnabled: isLink && isNotEmpty(defaultMassActions) && defaultMassActions.includes('deactivate'),
            store: {view, dispatch: viewSettingsDispatch},
            filtersStore: filtersData,
            pagination: noPagination ? null : {limit: view.pageSize, offset: view.pageSize * (currentPage - 1)},
            allVisibleKeys,
            onDelete: defaultCallbacks?.mass?.deactivate,
            refetch,
        });

        const _isSelectionDisable = disableSelection || (isLink && !isMultivalue && totalCount > 0);

        const massActionSnackbarId = useMemo(() => `${SNACKBAR_MASS_ID}_${Date.now()}`, []);

        const {setSelectedKeys, selectAllButton} = useMassActions({
            isEnabled:
                totalCount > 0 &&
                !_isSelectionDisable &&
                (isNotEmpty(defaultMassActions) || isNotEmpty(massActions) || !!defaultCallbacks?.item?.select),
            store: {view, dispatch: viewSettingsDispatch},
            filtersStore: filtersData,
            totalCount,
            allVisibleKeys,
            massActions: [
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

        const {viewSettingsButton, viewListButton} = useOpenViewSettings({view, isEnabled: !isMassSelectionAll});

        const {searchInput} = useSearchInput({view, dispatch: viewSettingsDispatch, setNewPage});

        useImperativeHandle(
            ref,
            () => ({
                createAction: createPrimaryAction,
                linkAction: linkPrimaryAction,
                totalCount,
            }),
            [createPrimaryAction?.disabled, linkPrimaryAction?.disabled, totalCount],
        );

        return (
            <>
                <FiltersContext.Provider value={{filtersData, dispatch: filtersDispatch}}>
                    <ViewSettingsContext.Provider value={{view, dispatch: viewSettingsDispatch}}>
                        <ExplorerPageDivStyled>
                            {showTitle && (
                                <ExplorerHeaderDivStyled>
                                    <KitTypography.Title level="h3">
                                        {
                                            !viewSettingsLoading && (
                                                <ExplorerTitle
                                                    library={view.libraryId}
                                                    title={title}
                                                    entrypoint={entrypoint}
                                                />
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
                                canRemoveFilters={view?.enableConfigureView ?? false}
                                selectAllButton={hideSelectAllAction ? null : selectAllButton}
                                viewSettingsLoading={viewSettingsLoading}
                            >
                                {view?.enableConfigureView ? viewListButton : null}
                                {showSearch ? searchInput : null}
                                {view?.enableConfigureView ? viewSettingsButton : null}
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
                                    attributesToDisplay={[WHO_AM_I_COLUMN, ...view.attributesIds]}
                                    hideTableHeader={hideTableHeader}
                                    paginationProps={
                                        entrypoint.type === 'library' && !noPagination
                                            ? {
                                                  pageSizeOptions: defaultPageSizeOptions,
                                                  currentPage,
                                                  pageSize: view.pageSize,
                                                  setNewPageSize,
                                                  setNewPage,
                                                  totalCount,
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
                                />
                            )}
                        </ExplorerPageDivStyled>
                        {settingsPanelElement && createPortal(<SidePanel />, settingsPanelElement?.() ?? document.body)}
                        {replaceItemModal}
                        {createModal}
                        {linkModal}
                        {editAttributeMassActionModal}
                    </ViewSettingsContext.Provider>
                </FiltersContext.Provider>
                <KitSnackBarProvider id={massActionSnackbarId} />
            </>
        );
    },
);
