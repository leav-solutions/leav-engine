import {type Override} from '@leav/utils';
import type * as z from 'zod/v4';
import {type ViewSettingsTabSchema} from '_ui/hooks/usePanelMessenger/schema';
import {
    type ExplorerV2AttributePropertiesFragment,
    type PropertyValueFragment,
    type RecordFilterCondition,
    type RecordFilterInput,
    type RecordIdentityFragment,
    type SortOrder,
} from '_ui/_gqlTypes';
import {type Key, type ReactElement} from 'react';
import {type ViewType} from './manage-view-settings-v2';
import {type MASS_SELECTION_ALL} from './_constants';
import {type UIFilter} from '../Filters/_types';

export type MassSelection = Key[] | typeof MASS_SELECTION_ALL;

/** Distributive, unlike `Override` alone: keeps the fragment union's members, hence the
 *  TreeAttribute-only fields (`linked_tree`, `permissions_conf_dependent_values`). */
type WithLocalizedLabel<T> = T extends unknown ? Override<T, {label: string}> : never;

/** ONE attribute's metadata, label already localized. */
export type AttributeProperties = WithLocalizedLabel<ExplorerV2AttributePropertiesFragment>;

/** EVERY attribute of the library, keyed by attribute id. Loaded upfront
 *  (`useExplorerLibraryMetadata`), no longer derived from the first record. */
export type AttributesPropertiesById = {[attributeId: string]: AttributeProperties};

/** What a cell renderer needs: everything but the label (owned by the column header). */
export type CellAttributeProperties = Pick<
    AttributeProperties,
    'id' | 'type' | 'format' | 'multiple_values' | 'multi_link_display_option' | 'multi_tree_display_option'
>;

export interface IExplorerData {
    totalCount: number;
    records: IItemData[];
}

export interface IItemData {
    libraryId: string;
    key: string;
    itemId: string;
    whoAmI: Required<RecordIdentityFragment['whoAmI']>;
    canActivate: boolean;
    canDelete: boolean;
    active: boolean;
    propertiesById: {
        [attributeId: string]: PropertyValueFragment[];
    };
    /**
     * Can be named `linkId` too, but for historical reason we keep old name 👴🏼.
     */
    id_value?: string;
}

export interface IItemAction {
    callback: (item: IItemData) => void;
    icon: ReactElement | ((item: IItemData) => ReactElement);
    label: string | ((item: IItemData) => string);
    isDanger?: boolean | ((item: IItemData) => boolean);
    disabled?: boolean | ((item: IItemData) => boolean);
    useItemActionOnRowClick?: boolean;
    useItemDeletePermission?: boolean; //TODO: Add for PanelAttributeExplorer custom action (should be deleted later)
}

export interface IPrimaryAction {
    callback: () => void;
    disabled?: boolean;
    icon: ReactElement;
    label: string;
}

export interface IMassActions {
    callback: (
        massSelectedFilter: RecordFilterInput[],
        massSelection: MassSelection,
        searchQuery?: string,
    ) => void | Promise<void>;
    deselectAll: boolean;
    icon: ReactElement;
    label: string;
}

export type FeatureHook<T = unknown> = {isEnabled: boolean; isVisible?: boolean} & T;

/**
 * Lean, JSON-serializable projection of a USER filter — the message-ready transport shape carried by the
 * controlled view contract (`SerializedView.filters`) and emitted by `useControlledFilterStore`'s
 * `onChange`. It holds exactly what `useViewFiltersConverter` needs to rebuild a full `UIFilter` (the
 * attribute descent path + condition + values) plus the view-level `pinned` flag. A full `UIFilter` is
 * NOT serializable (it embeds non-serializable GraphQL fragment data), so only this lean form crosses the
 * host↔panel boundary — and, later, the iframe boundary (the point of routing filters through the
 * controlled view rather than a shared React context, ADR-006; LEAVC-810).
 *
 * `hidden` is `false`/absent here. Masked pre-filters stay FULL filters — see {@link HiddenFullFilter}.
 */
export type SerializedFilter = {
    attributes: Array<{id: string; label?: Record<string, string> | null}>;
    condition: RecordFilterCondition | null;
    values: Array<string | null>;
    pinned?: boolean;
    hidden?: false;
    withEmptyValues?: boolean;
};

/**
 * A masked pre-filter (e.g. PanelAttributeExplorer's link pre-filter): a FULL `UIFilter` flagged
 * `hidden: true`, injected by the host into `currentView.filters`. It is merged into the records request
 * but never shown in the UI, and is NOT lean-ified (its through-filter shape is consumed as-is). The
 * `hidden` flag discriminates it from the lean {@link SerializedFilter}. (Lean-ifying it is deferred with
 * the real iframe postMessage wiring — LEAVC-810 "Différé".)
 */
export type HiddenFullFilter = UIFilter & {hidden: true};

/** True for the masked full pre-filter arm of `SerializedView.filters`, false for a lean user filter. */
export const isHiddenFullFilter = (filter: SerializedFilter | HiddenFullFilter): filter is HiddenFullFilter =>
    filter.hidden === true;

/**
 * Single view contract between panel-view-settings (source of truth) and ExplorerV2 (pure consumer).
 *
 * panel-view-settings fetches the viewV2, converts it (see `viewV2ToSerializedView`) and feeds the result
 * to the controlled `currentView` prop. It carries the **display** config (`viewType`, `attributesIds`,
 * `sort`) **and** the `filters`: the lean USER filters ({@link SerializedFilter}) plus any masked
 * ({@link HiddenFullFilter}) pre-filter, discriminated by `hidden`.
 */
export type SerializedView = {
    viewId?: string | null;
    viewLabels?: Record<string, string>;
    viewType?: ViewType;
    attributesIds?: string[];
    /**
     * Id of the attribute designated as the grouping axis (kanban columns, future table grouping…).
     * Generic, display-mode-agnostic. It is always one of `attributesIds`. Derived host-side from the
     * `display.attributes` entry flagged `isGroupBy` (see `viewV2ToSerializedView`).
     */
    groupByAttributeId?: string;
    sort?: Array<{field: string; order: SortOrder}>;
    filters?: Array<SerializedFilter | HiddenFullFilter>;
    filtersOperator?: 'AND' | 'OR';
    shortcuts?: ViewSettingsShortcuts[];
    displaySettings?: Record<string, unknown>;
};

export type ViewSettingsShortcuts = z.infer<typeof ViewSettingsTabSchema>;

/** Payload of `onFiltersChange`: the WHOLE lean user-filter set (covers edition AND removal). */
export type FiltersChangePayload = {
    filters: SerializedFilter[];
};

export interface IEntrypointTree {
    type: 'tree';
    treeId: string;
    nodeId: string;
}

export interface IEntrypointLibrary {
    type: 'library';
    libraryId: string;
    /**
     * Used to display a list of values instead of all library records when adding a link
     */
    valuesList?: string[];
    /**
     * Used to allow free entry when adding a link with values list
     */
    allowFreeEntry?: boolean;
}

export interface IEntrypointLink {
    type: 'link';
    parentLibraryId: string;
    parentRecordId: string;
    linkAttributeId: string;
}

export type Entrypoint = IEntrypointTree | IEntrypointLibrary | IEntrypointLink;

export interface IDataViewOnAction {
    id: string | null;
    label: Record<string, string> | null;
}

export type SetNewPage = (newCurrentPage: number, ignoredPageSize: number) => void;

/**
 * Everything the kanban needs to load its columns itself (per-column pagination): the records request
 * parameters of the current view, with filters already prepared for the request. Only library
 * entrypoints provide one — without it the kanban falls back to grouping the globally-loaded set.
 */
export interface IKanbanDataSource {
    libraryId: string;
    attributeIds: string[];
    filters: RecordFilterInput[];
    searchQuery: string;
    sorts: Array<{field: string; order: SortOrder}>;
}

/**
 * Props shared by every display-mode renderer (TableView, KanbanView…). The `DataView` router owns the
 * `viewType`/`groupByAttributeId` switch and forwards this same shape to whichever renderer it picks, so
 * a mode can be added without touching the router's call site in `Explorer.tsx`.
 */
export interface IDataViewChildProps {
    dataGroupedFilteredSorted: IItemData[];
    itemActions: IItemAction[];
    attributesProperties: AttributesPropertiesById;
    attributesToDisplay: string[];
    paginationProps?: {
        pageSizeOptions: number[];
        totalCount: number;
        currentPage: number;
        pageSize: number;
        setNewPage: (page: number, pageSize: number) => void;
        setNewPageSize: (page: number, pageSize: number) => void;
    };
    selection: {
        onSelectItem?: null | ((selectedItem: IItemData) => void);
        onSelectionChange: null | ((keys: Key[]) => void);
        isMassSelectionAll: boolean;
        selectedKeys: Key[];
        mode?: 'simple' | 'multiple';
    };
    hideTableHeader: boolean;
    useSmallHeaderSize?: boolean;
    tableBodyHeight?: string;
}
