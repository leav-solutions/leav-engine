// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Override} from '@leav/utils';
import {
    type AttributeFormat,
    AttributeType,
    type LinkAttributeDetailsFragment,
    type RecordFilterCondition,
    type StandardAttributeDetailsFragment,
    type ViewDetailsFilterFragment,
} from '_ui/_gqlTypes';
import {ThroughConditionFilter} from '_ui/types/search';

export type FiltersOperator = 'AND' | 'OR';

export interface IUIFilterBaseAttribute {
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

export interface IUIFilterStandardAttribute extends IUIFilterBaseAttribute {
    format: AttributeFormat;
}

export interface IUIFilterLinkAttribute extends IUIFilterBaseAttribute {
    linkedLibrary?: {
        id: string;
    };
    smartFilter?: {
        enable?: boolean;
        through?: {
            id: string;
        } | null;
    };
}

export interface IUIFilterTreeAttribute extends IUIFilterBaseAttribute {
    linkedTree?: {
        id: string;
    };
}

interface IUIFilterBase {
    id: string;
    attribute: IUIFilterBaseAttribute;
    condition: RecordFilterCondition | ThroughConditionFilter | null;
    /**
     * Used to build filter field.
     *
     * - ex: `campaigns_id_pac`
     * - ex with **subField**: `campaigns_id_pac.id`
     */
    field: any;
    value: string | null;
    formattedValue?: string | null;
    hidden?: boolean | undefined;
    withEmptyValues?: boolean;
}

export interface IUIFilterStandard extends Omit<IUIFilterBase, 'field'> {
    attribute: IUIFilterStandardAttribute;
    condition: RecordFilterCondition | null;
    field: string;
}

export interface IUIFilterLink extends Omit<IUIFilterBase, 'field'> {
    attribute: IUIFilterLinkAttribute;
    condition: RecordFilterCondition | null;
    field: string;
}

export interface IUIFilterThrough extends Omit<IUIFilterBase, 'field'> {
    attribute: IUIFilterLinkAttribute;
    condition: ThroughConditionFilter.THROUGH | null;
    subCondition: RecordFilterCondition | null;
    subField: string | null;
    field: string;
}

export interface IUIFilterTree extends Omit<IUIFilterBase, 'value' | 'formattedValue' | 'field'> {
    attribute: IUIFilterTreeAttribute;
    condition: RecordFilterCondition | null;
    value: string[] | null;
    formattedValue?: string[] | null;
    nodes?: null | Array<{nodeId: string; libraryId: string}>;
    field: string[];
    includeHiddenOptions?: boolean;
    /** Nodes explicitly selected by the user. Null/undefined = no user selection (use initial filter). */
    userNodes?: null | Array<{nodeId: string; libraryId: string}>;
    /** Labels for user-selected nodes (used for display in CommonFilterItem). */
    userFormattedValue?: string[] | null;
}

export interface IUIFilterSmartFiler extends Omit<IUIFilterBase, 'value' | 'formattedValue'> {
    attribute: IUIFilterLinkAttribute;
    value: string[] | null;
    formattedValue?: string[] | null;
    condition: RecordFilterCondition | null;
    field: string;
}

export interface IUIFilterValueList extends Omit<IUIFilterBase, 'value' | 'formattedValue'> {
    attribute: (IUIFilterStandardAttribute | IUIFilterLinkAttribute) & {
        valuesList:
            | NonNullable<StandardAttributeDetailsFragment['valuesList']>
            | NonNullable<LinkAttributeDetailsFragment['valuesList']>;
    };
    value: string[] | null;
    condition: RecordFilterCondition | null;
    field: string | string[];
}

export interface IUIFilterStandardValueList extends Omit<IUIFilterStandard, 'attribute' | 'value'>, IUIFilterValueList {
    attribute: IUIFilterStandardAttribute & {
        valuesList: NonNullable<StandardAttributeDetailsFragment['valuesList']>;
    };
    field: string;
}

export interface IUIFilterLinkValueList extends Omit<IUIFilterLink, 'attribute' | 'value'>, IUIFilterValueList {
    attribute: IUIFilterLinkAttribute & {
        valuesList: NonNullable<LinkAttributeDetailsFragment['valuesList']>;
    };
    field: string;
}
export interface IUIFilterTreeValueList extends Omit<IUIFilterTree, 'attribute' | 'value'>, IUIFilterValueList {
    attribute: IUIFilterLinkAttribute & {
        valuesList: NonNullable<LinkAttributeDetailsFragment['valuesList']>;
    };
    field: string[];
}

export type UIFilter =
    | IUIFilterStandard
    | IUIFilterLink
    | IUIFilterThrough
    | IUIFilterValueList
    | IUIFilterTree
    | IUIFilterSmartFiler;

export const isUIFilterStandard = (filter: UIFilter): filter is IUIFilterStandard =>
    [AttributeType.simple, AttributeType.advanced].includes(filter.attribute.type);

export const isUIFilterLink = (filter: UIFilter): filter is IUIFilterLink =>
    [AttributeType.simple_link, AttributeType.advanced_link].includes(filter.attribute.type) &&
    filter.condition !== ThroughConditionFilter.THROUGH;

export const isUIFilterThrough = (filter: UIFilter): filter is IUIFilterThrough =>
    [AttributeType.simple_link, AttributeType.advanced_link].includes(filter.attribute.type) &&
    filter.condition === ThroughConditionFilter.THROUGH;

export const isUIFilterValueList = (filter: UIFilter): filter is IUIFilterValueList =>
    (isUIFilterStandard(filter) || isUIFilterLink(filter) || isUIFilterWithSmartFilter(filter)) && isValueList(filter);

export const isUIFilterStandardWithValueList = (filter: UIFilter): filter is IUIFilterStandardValueList =>
    [AttributeType.simple, AttributeType.advanced].includes(filter.attribute.type) && isValueList(filter);

export const isUIFilterLinkWithValueList = (filter: UIFilter): filter is IUIFilterLinkValueList =>
    [AttributeType.simple_link, AttributeType.advanced_link].includes(filter.attribute.type) && isValueList(filter);

export const isUIFilterTree = (filter: UIFilter): filter is IUIFilterTree =>
    filter.attribute.type === AttributeType.tree;

export const isUIFilterTreeWithValueList = (filter: UIFilter): filter is IUIFilterTreeValueList =>
    isUIFilterTree(filter) && isValueList(filter);

export const isUIFilterWithSmartFilter = (filter: UIFilter): filter is IUIFilterSmartFiler =>
    (isUIFilterLink(filter) || isUIFilterThrough(filter)) && filter.attribute.smartFilter?.enable;

const isValueList = (filter: UIFilter): filter is UIFilter & {attribute: {valuesList: {enabled: true}}} =>
    !!filter.attribute?.valuesList && filter.attribute?.valuesList.enable;

export interface IUIFilterDropDownProps {
    filter: UIFilter;
    canReset: boolean;
    canRemove: boolean;
}

export type ValidFieldFilter = Override<
    ViewDetailsFilterFragment,
    {
        field: NonNullable<ViewDetailsFilterFragment['field']>;
        condition: NonNullable<ViewDetailsFilterFragment['condition']>;
        hidden: boolean;
        withEmptyValues?: boolean;
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

export type ValidFilter =
    | ValidFieldFilter
    | ValidFieldFilterThrough
    | ValidFieldFilterStandardValuesList
    | ValidFieldFilterLinkValuesList;
