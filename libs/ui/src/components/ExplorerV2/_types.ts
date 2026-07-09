import {type Override} from '@leav/utils';
import type * as z from 'zod/v4';
import {type ViewSettingsTabSchema} from '_ui/hooks/usePanelMessenger/schema';
import {
    type AttributePropertiesFragment,
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

export interface IExplorerData {
    totalCount: number;
    attributes: {
        [attributeId: string]: Override<AttributePropertiesFragment, {label: string}>;
    };
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
    callback: (massSelectedFilter: RecordFilterInput[], massSelection: MassSelection) => void | Promise<void>;
    deselectAll: boolean;
    icon: ReactElement;
    label: string;
}

export type FeatureHook<T = {}> = {isEnabled: boolean; isVisible?: boolean} & T;

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
