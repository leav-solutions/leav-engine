// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Override} from '@leav/utils';
import {
    type AttributeFormat,
    type AttributePropertiesFragment,
    AttributeType,
    type LinkAttributeDetailsFragment,
    type PropertyValueFragment,
    type RecordFilterCondition,
    type RecordFilterInput,
    type RecordIdentityFragment,
    type StandardAttributeDetailsFragment,
    type ViewDetailsFilterFragment
} from '_ui/_gqlTypes';
import {type Key, type ReactElement} from 'react';
import {type IViewSettingsState} from './manage-view-settings';
import {ThroughConditionFilter} from '_ui/types/search';
import {type IView} from '_ui/types';
import {type MASS_SELECTION_ALL} from './_constants';

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

export type FeatureHook<T = {}> = {isEnabled: boolean; isVisible?: boolean} & T;

export interface IExplorerFilterBaseAttribute {
    type: AttributeType;
    /**
     * Used to display the label of the filter.
     *
     * > Not displayed when filter is hidden
     */
    label: string;
    /**
     * Used to verify unicity: one filter per attribute
     */
    id: string;
    format?: AttributeFormat | null | undefined;
    valuesList?:
        | NonNullable<StandardAttributeDetailsFragment['valuesList']>
        | NonNullable<LinkAttributeDetailsFragment['valuesList']>;
}

export interface IExplorerFilterStandardAttribute extends IExplorerFilterBaseAttribute {
    format: AttributeFormat;
}

export interface IExplorerFilterLinkAttribute extends IExplorerFilterBaseAttribute {
    linkedLibrary?: {
        id: string;
    };
}

export interface IExplorerFilterTreeAttribute extends IExplorerFilterBaseAttribute {
    linkedTree?: {
        id: string;
    };
}

interface IExplorerBaseFilter {
    id: string;
    attribute: IExplorerFilterBaseAttribute;
    condition: RecordFilterCondition | ThroughConditionFilter | null;
    /**
     * Used to build filter field.
     *
     * - ex: `campaigns_id_pac`
     * - ex with **subField**: `campaigns_id_pac.id`
     */
    field: string;
    value: string | null;
    formattedValue?: string | null;
    hidden?: boolean | undefined;
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

export interface IExplorerFilterTree extends Omit<IExplorerBaseFilter, 'value' | 'formattedValue' | 'field'> {
    attribute: IExplorerFilterTreeAttribute;
    condition: RecordFilterCondition | null;
    value: string[] | null;
    formattedValue?: string[] | null;
    field: string[];
}

export interface IExplorerFilterValueList extends Omit<IExplorerBaseFilter, 'value' | 'formattedValue'> {
    attribute: (IExplorerFilterStandardAttribute | IExplorerFilterLinkAttribute) & {
        valuesList:
            | NonNullable<StandardAttributeDetailsFragment['valuesList']>
            | NonNullable<LinkAttributeDetailsFragment['valuesList']>;
    };
    value: string[] | null;
    condition: RecordFilterCondition | null;
}

export interface IExplorerFilterStandardValueList
    extends Omit<IExplorerFilterStandard, 'attribute' | 'value'>,
        IExplorerFilterValueList {
    attribute: IExplorerFilterStandardAttribute & {
        valuesList: NonNullable<StandardAttributeDetailsFragment['valuesList']>;
    };
}

export interface IExplorerFilterLinkValueList
    extends Omit<IExplorerFilterLink, 'attribute' | 'value'>,
        IExplorerFilterValueList {
    attribute: IExplorerFilterLinkAttribute & {
        valuesList: NonNullable<LinkAttributeDetailsFragment['valuesList']>;
    };
}

export type ExplorerFilter =
    | IExplorerFilterStandard
    | IExplorerFilterLink
    | IExplorerFilterThrough
    | IExplorerFilterValueList
    | IExplorerFilterTree;

export const isExplorerFilterStandard = (filter: ExplorerFilter): filter is IExplorerFilterStandard =>
    [AttributeType.simple, AttributeType.advanced].includes(filter.attribute.type);

export const isExplorerFilterLink = (filter: ExplorerFilter): filter is IExplorerFilterLink =>
    [AttributeType.simple_link, AttributeType.advanced_link].includes(filter.attribute.type) &&
    filter.condition !== ThroughConditionFilter.THROUGH;

export const isExplorerFilterThrough = (filter: ExplorerFilter): filter is IExplorerFilterThrough =>
    [AttributeType.simple_link, AttributeType.advanced_link].includes(filter.attribute.type) &&
    filter.condition === ThroughConditionFilter.THROUGH;

export const isExplorerFilterValueList = (filter: ExplorerFilter): filter is IExplorerFilterValueList =>
    (isExplorerFilterStandard(filter) || isExplorerFilterLink(filter)) && isValueList(filter);

export const isExplorerFilterStandardWithValueList = (
    filter: ExplorerFilter
): filter is IExplorerFilterStandardValueList =>
    [AttributeType.simple, AttributeType.advanced].includes(filter.attribute.type) && isValueList(filter);

export const isExplorerFilterLinkWithValueList = (filter: ExplorerFilter): filter is IExplorerFilterLinkValueList =>
    [AttributeType.simple_link, AttributeType.advanced_link].includes(filter.attribute.type) && isValueList(filter);

export const isExplorerFilterTree = (filter: ExplorerFilter): filter is IExplorerFilterTree =>
    filter.attribute.type === AttributeType.tree;

const isValueList = (filter: ExplorerFilter): filter is ExplorerFilter & {attribute: {valuesList: {enabled: true}}} =>
    !!filter.attribute?.valuesList && filter.attribute?.valuesList.enable;

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

export type ValidFieldFilter = Override<
    ViewDetailsFilterFragment,
    {
        field: NonNullable<ViewDetailsFilterFragment['field']>;
        condition: NonNullable<ViewDetailsFilterFragment['condition']>;
        hidden: boolean;
    }
>;

export type ValidFieldFilterStandardValuesList = Override<
    ValidFieldFilter,
    {
        valuesList: StandardAttributeDetailsFragment['valuesList'];
    }
>;

export type ValidFieldFilterLinkValuesList = Override<
    ValidFieldFilter,
    {
        valuesList: LinkAttributeDetailsFragment['valuesList'];
    }
>;

export type ValidFieldFilterThrough = Override<
    ValidFieldFilter,
    {
        condition: ThroughConditionFilter.THROUGH;
        hidden: boolean;
    }
> & {
    subField: NonNullable<ViewDetailsFilterFragment['field']>;
    subCondition?: ViewDetailsFilterFragment['condition'];
};

export type validFilter =
    | ValidFieldFilter
    | ValidFieldFilterThrough
    | ValidFieldFilterStandardValuesList
    | ValidFieldFilterLinkValuesList;

export type Entrypoint = IEntrypointTree | IEntrypointLibrary | IEntrypointLink;

export interface IUserView extends Pick<IView, 'shared' | 'display' | 'sort' | 'attributes'> {
    label: Record<string, string>;
    id: IView['id'] | null;
    filters: validFilter[];
    ownerId: string | null;
}

export interface IDataViewOnAction {
    id: string | null;
    label: Record<string, string> | null;
}

export type SetNewPage = (newCurrentPage: number, ignoredPageSize: number) => void;
