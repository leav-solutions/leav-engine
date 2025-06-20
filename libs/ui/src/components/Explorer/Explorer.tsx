// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ReactNode, forwardRef, useImperativeHandle} from 'react';
import {createPortal} from 'react-dom';
import {KitEmpty, KitSpace, KitTypography} from 'aristid-ds';
import styled from 'styled-components';
import {Loading} from '_ui/components/Loading';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {DefaultViewSettings, Entrypoint, IMassActions, IPrimaryAction, IItemAction} from './_types';
import {useExplorerData} from './_queries/useExplorerData';
import {DataView} from './DataView';
import {ExplorerTitle} from './ExplorerTitle';
import {ExplorerToolbar} from './ExplorerToolbar';
import {useEditStatusItemAction} from './actions-item/useEditStatusItemAction';
import {useEditItemAction} from './actions-item/useEditItemAction';
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
    ViewSettingsContext
} from './manage-view-settings';
import {useSearchInput} from './useSearchInput';
import {usePagination} from './usePagination';
import {useViewSettingsReducer} from './useViewSettingsReducer';
import {MASS_SELECTION_ALL} from './_constants';
import {useDeleteLinkValues} from './actions-mass/useDeleteLinkValues';
import {useReplaceItemAction} from './actions-item/useReplaceItemAction';

const isNotEmpty = <T extends unknown[]>(union: T): union is Exclude<T, []> => union.length > 0;

const emptyArray = [];
const emptyObject = {};

const ExplorerHeaderDivStyled = styled.div`
    display: flex;
    align-items: flex-start;
    padding: calc(var(--general-spacing-xs) * 1px);
`;

const ExplorerActionsDivStyled = styled.div`
    display: flex;
    justify-content: space-between;
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
    iconsOnlyItemActions?: boolean;
    primaryActions?: IPrimaryAction[];
    massActions?: IMassActions[];
    title?: string;
    selectionMode?: 'multiple' | 'simple';
    emptyPlaceholder?: ReactNode;
    defaultActionsForItem?: Array<'edit' | 'replaceLink' | 'remove' | 'activate'>;
    defaultPrimaryActions?: Array<'create'>;
    defaultMassActions?: Array<'deactivate'>;
    defaultViewSettings?: DefaultViewSettings;
    defaultCallbacks?: {
        item?: {
            edit?: IItemAction['callback'];
            replaceLink?: (replaceValuesResult: ISubmitMultipleResult) => void;
            remove?: IItemAction['callback'];
        };
        primary?: {
            create?: ({
                recordIdCreated,
                saveValuesResultOnLink
            }: {
                recordIdCreated: string;
                saveValuesResultOnLink?: ISubmitMultipleResult;
            }) => void;
            link?: (saveValuesResult: ISubmitMultipleResult) => void;
        };
        mass?: {
            deactivate?: IMassActions['callback'];
        };
    };
    showFiltersAndSorts?: boolean;
    enableConfigureView?: boolean;
    ignoreViewByDefault?: boolean;
    showTitle?: boolean;
    showSearch?: boolean;
    disableSelection?: boolean;
    hideSelectAllAction?: boolean;
    hidePrimaryActions?: boolean;
    hideTableHeader?: boolean;
    creationFormId?: string;
    editionFormId?: string;
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
            selectionMode,
            emptyPlaceholder,
            noPagination,
            creationFormId,
            editionFormId,
            showFiltersAndSorts = false,
            enableConfigureView = false,
            disableSelection = false,
            hideSelectAllAction = false,
            iconsOnlyItemActions = false,
            showTitle = false,
            showSearch = false,
            hidePrimaryActions = false,
            hideTableHeader = false,
            ignoreViewByDefault = false,
            defaultActionsForItem = ['edit', 'replaceLink', 'remove', 'activate'],
            defaultPrimaryActions = ['create'],
            defaultMassActions = ['deactivate'],
            defaultCallbacks,
            defaultViewSettings
        },
        ref
    ) => {
        const {t} = useSharedTranslation();

        const {panelElement: settingsPanelElement} = useEditSettings();

        const {
            loading: viewSettingsLoading,
            view,
            dispatch
        } = useViewSettingsReducer(entrypoint, defaultViewSettings, ignoreViewByDefault);

        const {currentPage, setNewPageSize, setNewPage} = usePagination(dispatch);

        const {
            data,
            isMultivalue,
            canEditLinkAttributeValues,
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
            filtersOperator: view.filtersOperator,
            skip: viewSettingsLoading
        }); // TODO: refresh when go back on page
        const isMassSelectionAll = view.massSelection === MASS_SELECTION_ALL;
        const isLink = entrypoint.type === 'link';

        const {editStatusItemAction} = useEditStatusItemAction({
            isEnabled:
                isNotEmpty(defaultActionsForItem) &&
                (defaultActionsForItem.includes('remove') || defaultActionsForItem.includes('activate')),
            onRemove: defaultCallbacks?.item?.remove,
            canDeleteLinkValues: canEditLinkAttributeValues,
            store: {view, dispatch},
            entrypoint
        });

        const {replaceItemAction, replaceItemModal} = useReplaceItemAction({
            isEnabled: isLink && isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('replaceLink'),
            onReplace: defaultCallbacks?.item?.replaceLink,
            canReplaceLinkValues: canEditLinkAttributeValues
        });

        const {editItemAction, editItemModal} = useEditItemAction({
            isEnabled: isNotEmpty(defaultActionsForItem) && defaultActionsForItem.includes('edit'),
            onEdit: defaultCallbacks?.item?.edit,
            formId: editionFormId,
            refetch
        });

        const totalCount = data?.totalCount ?? 0;

        const {createPrimaryAction, createModal} = useCreatePrimaryAction({
            isEnabled: isNotEmpty(defaultPrimaryActions) && defaultPrimaryActions.includes('create'),
            libraryId: view.libraryId,
            canCreateAndLinkValue: canEditLinkAttributeValues,
            onCreate: defaultCallbacks?.primary?.create,
            entrypoint,
            totalCount,
            formId: creationFormId,
            refetch
        });
        const {linkPrimaryAction, linkModal} = useLinkPrimaryAction({
            entrypoint,
            isEnabled: isLink,
            canAddLinkValue: canEditLinkAttributeValues,
            onLink: defaultCallbacks?.primary?.link,
            linkId: data?.totalCount === 0 ? undefined : data?.records[0]?.id_value,
            maxItemsLeft: null // TODO: use KitTable.row
        });

        const allVisibleKeys = data?.records.map(({key}) => key) ?? [];

        const {deactivateMassAction} = useDeactivateMassAction({
            isEnabled: !isLink && isNotEmpty(defaultMassActions) && defaultMassActions.includes('deactivate'),
            store: {view, dispatch},
            allVisibleKeys,
            totalCount,
            onDeactivate: defaultCallbacks?.mass?.deactivate,
            refetch
        });

        const {unlinkMassAction} = useDeleteLinkValues({
            isEnabled: isLink && isNotEmpty(defaultMassActions) && defaultMassActions.includes('deactivate'),
            store: {view, dispatch},
            pagination: noPagination ? null : {limit: view.pageSize, offset: view.pageSize * (currentPage - 1)},
            allVisibleKeys,
            onDelete: defaultCallbacks?.mass?.deactivate,
            refetch
        });

        const _isSelectionDisable = disableSelection || (isLink && !isMultivalue && totalCount > 0);

        const {setSelectedKeys, selectAllButton} = useMassActions({
            isEnabled:
                totalCount > 0 && !_isSelectionDisable && (isNotEmpty(defaultMassActions) || isNotEmpty(massActions)),
            store: {view, dispatch},
            totalCount,
            allVisibleKeys,
            massActions: [deactivateMassAction, unlinkMassAction, ...massActions].filter(Boolean)
        });

        const {primaryButton} = usePrimaryActionsButton({
            view,
            actions: [createPrimaryAction, linkPrimaryAction, ...primaryActions].filter(Boolean)
        });

        const {viewSettingsButton, viewListButton} = useOpenViewSettings({view, isEnabled: !isMassSelectionAll});

        const {searchInput} = useSearchInput({view, dispatch, setNewPage});

        useImperativeHandle(
            ref,
            () => ({
                createAction: createPrimaryAction,
                linkAction: linkPrimaryAction,
                totalCount
            }),
            [createPrimaryAction?.disabled, linkPrimaryAction?.disabled, totalCount]
        );

        const hasNoResults = data === null || data.totalCount === 0;

        return (
            <ViewSettingsContext.Provider value={{view, dispatch}}>
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
                    {(showSearch || enableConfigureView || !hidePrimaryActions) && (
                        <ExplorerActionsDivStyled>
                            <div>{showSearch && searchInput}</div>
                            <KitSpace size="xs">
                                {enableConfigureView && viewListButton}
                                {enableConfigureView && viewSettingsButton}
                                {!hidePrimaryActions && primaryButton}
                            </KitSpace>
                        </ExplorerActionsDivStyled>
                    )}
                    {!viewSettingsLoading && (
                        <ExplorerToolbar
                            showFiltersAndSort={showFiltersAndSorts}
                            isMassSelectionAll={isMassSelectionAll}
                            headless={hideTableHeader}
                        >
                            {!hideSelectAllAction && selectAllButton}
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
                            iconsOnlyItemActions={iconsOnlyItemActions}
                            hideTableHeader={hideTableHeader}
                            paginationProps={
                                entrypoint.type === 'library' && !noPagination
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
                            itemActions={[editItemAction, replaceItemAction, editStatusItemAction, ...itemActions]
                                .filter(Boolean)
                                .map(action => ({
                                    ...action,
                                    disabled: isMassSelectionAll || action.disabled
                                }))}
                            selection={{
                                onSelectionChange: _isSelectionDisable ? null : setSelectedKeys,
                                isMassSelectionAll,
                                selectedKeys: isMassSelectionAll
                                    ? data?.records.map(({whoAmI}) => whoAmI.id)
                                    : (view.massSelection as string[]),
                                mode: selectionMode
                            }}
                        />
                    )}
                </ExplorerPageDivStyled>
                {settingsPanelElement && createPortal(<SidePanel />, settingsPanelElement?.() ?? document.body)}
                {editItemModal}
                {replaceItemModal}
                {createModal}
                {linkModal}
            </ViewSettingsContext.Provider>
        );
    }
);
