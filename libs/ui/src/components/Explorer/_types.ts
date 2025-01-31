// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Override} from '@leav/utils';
import {
    AttributeFormat,
    AttributePropertiesFragment,
    PropertyValueFragment,
    RecordFilterCondition,
    RecordFilterInput,
    RecordIdentityFragment
} from '_ui/_gqlTypes';
import {ReactElement} from 'react';
import {IViewSettingsState} from './manage-view-settings';

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
    icon: ReactElement;
    label: string;
    isDanger?: boolean;
    disabled?: boolean;
}

export interface IPrimaryAction {
    callback: () => void;
    disabled?: boolean;
    icon: ReactElement;
    label: string;
}

export interface IMassActions {
    callback: (massSelectedFilter: RecordFilterInput[]) => void | Promise<void>;
    icon: ReactElement;
    label: string;
}

export type ActionHook<T = {}> = {isEnabled: boolean} & T;

export interface IExplorerFilter {
    id: string;
    attribute: {
        format: AttributeFormat;
        label: string;
    };
    field: string;
    condition: RecordFilterCondition | null;
    value: string | null;
}

export interface IFilterChildrenDropDownProps {
    filter: IExplorerFilter;
    onFilterChange: (filterData: IExplorerFilter) => void;
}

export interface IFilterDropDownProps {
    filter: IExplorerFilter;
}

export type DefaultViewSettings = Override<
    Partial<IViewSettingsState>,
    {
        filters?: Array<{
            field: string;
            condition: RecordFilterCondition;
            value: string | null;
        }>;
    }
>;

export interface IEntrypointTree {
    type: 'tree';
    treeId: string;
    nodeId: string;
}

export interface IEntrypointLibrary {
    type: 'library';
    libraryId: string;
}

export interface IEntrypointLink {
    type: 'link';
    parentLibraryId: string;
    parentRecordId: string;
    linkAttributeId: string;
}

export type Entrypoint = IEntrypointTree | IEntrypointLibrary | IEntrypointLink;
