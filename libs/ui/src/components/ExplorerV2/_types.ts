import {type Override} from '@leav/utils';
import type * as z from 'zod/v4';
import {type ViewSettingsTabSchema} from '_ui/hooks/usePanelMessenger/schema';
import {
    type AttributePropertiesFragment,
    type PropertyValueFragment,
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
 * Single view contract between panel-view-settings (source of truth) and ExplorerV2 (pure consumer).
 *
 * panel-view-settings fetches the viewV2, converts it (see `viewV2ToSerializedView`) and feeds the result
 * to the controlled `currentView` prop. It carries the **display** config (`viewType`,
 * `attributesIds`, `sort`) **and** the `filters` — both the user filters and the masked
 * (`hidden: true`) pre-filters (e.g. the link pre-filter).
 */
export type SerializedView = {
    viewId?: string | null;
    viewLabels?: Record<string, string>;
    viewType?: ViewType;
    attributesIds?: string[];
    sort?: Array<{field: string; order: SortOrder}>;
    filters?: UIFilter[];
    filtersOperator?: 'AND' | 'OR';
    shortcuts?: ViewSettingsShortcuts[];
};

export type ViewSettingsShortcuts = z.infer<typeof ViewSettingsTabSchema>;

export type FiltersChangePayload = {
    filters: UIFilter[];
    filtersOperator: 'AND' | 'OR';
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
