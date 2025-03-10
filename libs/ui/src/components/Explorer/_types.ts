// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Override} from '@leav/utils';
import {
    AttributeFormat,
    AttributePropertiesFragment,
    AttributeType,
    PropertyValueFragment,
    RecordFilterCondition,
    RecordFilterInput,
    RecordIdentityFragment,
    ViewDetailsFilterFragment
} from '_ui/_gqlTypes';
import {Key, ReactElement} from 'react';
import {IViewSettingsState} from './manage-view-settings';
import {ThroughConditionFilter} from '_ui/types/search';
import {IView} from '_ui/types';
import {MASS_SELECTION_ALL} from './_constants';

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
    iconOnly?: boolean;
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
    callback: (massSelectedFilter: RecordFilterInput[], massSelection: MassSelection) => void | Promise<void>;
    icon: ReactElement;
    label: string;
}

export type FeatureHook<T = {}> = {isEnabled: boolean} & T;

interface IExplorerFilterBaseAttribute {
    type: AttributeType;
    label: string;
}

interface IExplorerFilterStandardAttribute extends IExplorerFilterBaseAttribute {
    format: AttributeFormat;
}

interface IExplorerFilterLinkAttribute extends IExplorerFilterBaseAttribute {
    linkedLibrary?: {
        id: string;
    };
}

interface IExplorerBaseFilter {
    id: string;
    field: string;
    value: string | null;
}

export interface IExplorerFilterStandard extends IExplorerBaseFilter {
    attribute: IExplorerFilterStandardAttribute;
    condition: RecordFilterCondition | null;
}

export interface IExplorerFilterLink extends IExplorerBaseFilter {
    attribute: IExplorerFilterLinkAttribute;
    condition: RecordFilterCondition | null;
}

export interface IExplorerFilterThrough extends IExplorerBaseFilter {
    attribute: IExplorerFilterLinkAttribute;
    condition: ThroughConditionFilter.THROUGH | null;
    subCondition: RecordFilterCondition | null;
    subField: string | null;
}

export type ExplorerFilter = IExplorerFilterStandard | IExplorerFilterLink | IExplorerFilterThrough;

export const isExplorerFilterStandard = (filter: ExplorerFilter): filter is IExplorerFilterStandard =>
    [AttributeType.simple, AttributeType.advanced].includes(filter.attribute.type);

export const isExplorerFilterLink = (filter: ExplorerFilter): filter is IExplorerFilterLink =>
    [AttributeType.simple_link, AttributeType.advanced_link].includes(filter.attribute.type) &&
    filter.condition !== ThroughConditionFilter.THROUGH;

export const isExplorerFilterThrough = (filter: ExplorerFilter): filter is IExplorerFilterThrough =>
    [AttributeType.simple_link, AttributeType.advanced_link].includes(filter.attribute.type) &&
    filter.condition === ThroughConditionFilter.THROUGH;

export interface IFilterDropDownProps {
    filter: ExplorerFilter;
}

export type DefaultViewSettings = Override<
    Partial<IViewSettingsState>,
    {
        filtersOperator?: 'AND' | 'OR';
        filters?: ExplorerFilter[];
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

export type ValidFieldFilter = Override<
    ViewDetailsFilterFragment,
    {
        field: NonNullable<ViewDetailsFilterFragment['field']>;
        condition: NonNullable<ViewDetailsFilterFragment['condition']>;
    }
>;

export type ValidFieldFilterThrough = Override<
    ValidFieldFilter,
    {
        condition: ThroughConditionFilter.THROUGH;
    }
> & {
    subField: NonNullable<ViewDetailsFilterFragment['field']>;
    subCondition?: ViewDetailsFilterFragment['condition'];
};

export type validFilter = ValidFieldFilter | ValidFieldFilterThrough;

export type Entrypoint = IEntrypointTree | IEntrypointLibrary | IEntrypointLink;

export interface IUserView extends Pick<IView, 'shared' | 'display' | 'sort' | 'attributes'> {
    label: Record<string, string>;
    id: IView['id'] | null;
    filters: validFilter[];
    ownerId: string | null;
}
