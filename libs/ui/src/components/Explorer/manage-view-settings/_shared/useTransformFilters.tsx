// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    AttributeDetailsLinkAttributeFragment,
    AttributeDetailsTreeAttributeFragment,
    AttributeType,
    ExplorerAttributesQuery,
    ExplorerLinkAttributeQuery,
    GetViewsListQuery,
    LinkAttributeDetailsFragment,
    RecordFilterCondition,
    StandardAttributeDetailsFragment,
    ViewDetailsFilterFragment
} from '_ui/_gqlTypes';
import {
    ExplorerFilter,
    IExplorerFilterBaseAttribute,
    IExplorerFilterLink,
    IExplorerFilterLinkValueList,
    IExplorerFilterStandard,
    IExplorerFilterStandardValueList,
    IExplorerFilterThrough,
    IExplorerFilterTree,
    ValidFieldFilter,
    ValidFieldFilterLinkValuesList,
    ValidFieldFilterStandardValuesList,
    ValidFieldFilterThrough,
    validFilter
} from '../../_types';
import {ThroughConditionFilter} from '_ui/types';
import {isLinkAttribute, isStandardAttribute, isTreeAttribute} from '_ui/_utils/attributeType';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {v4 as uuid} from 'uuid';
import {valueListTextConditions} from '../filter-items/filter-type/useConditionOptionsByType';

export const _isValidFieldFilter = (filter: ViewDetailsFilterFragment | ExplorerFilter): filter is ValidFieldFilter =>
    !!filter.field;

export const _isValidFieldFilterThrough = (filter: validFilter): filter is ValidFieldFilterThrough =>
    filter.condition === ThroughConditionFilter.THROUGH && !!filter.subCondition && !!filter.subField;

export const _isValidFieldFilterStandardValuesList = (
    filter: validFilter,
    attribute: NonNullable<ExplorerAttributesQuery['attributes']>['list'][number]
): filter is ValidFieldFilterStandardValuesList & {attribute: StandardAttributeDetailsFragment} =>
    valueListTextConditions.includes(filter.condition) &&
    [AttributeType.simple, AttributeType.advanced].includes(attribute.type) &&
    'valuesList' in attribute &&
    !!attribute.valuesList?.enable;

export const _isValidFieldFilterLinkValuesList = (
    filter: validFilter,
    attribute: NonNullable<ExplorerAttributesQuery['attributes']>['list'][number]
): filter is ValidFieldFilterLinkValuesList & {attribute: LinkAttributeDetailsFragment} =>
    valueListTextConditions.includes(filter.condition) &&
    [AttributeType.simple_link, AttributeType.advanced_link].includes(attribute.type) &&
    'valuesList' in attribute &&
    !!attribute.valuesList?.enable;

type AttributeDetailsLinkAttributeWithPermissionsFragment = AttributeDetailsLinkAttributeFragment & {
    permissions: {
        access_attribute: boolean;
    };
};
type AttributeDetailsTreeAttributeWithPermissionsFragment = AttributeDetailsTreeAttributeFragment & {
    permissions: {
        access_attribute: boolean;
    };
};

export const _isLinkAttributeDetails = (
    linkAttributeData: NonNullable<ExplorerLinkAttributeQuery['attributes']>['list'][number]
): linkAttributeData is LinkAttributeDetailsFragment & {
    id: string;
    multiple_values: boolean;
    permissions: {
        access_attribute: boolean;
        edit_value: boolean;
    };
} => 'linked_library' in linkAttributeData;

export type validFiltersArgument = GetViewsListQuery['views']['list'][number]['filters'] | ExplorerFilter[];

export type ExplorerAttributesById = Record<string, NonNullable<ExplorerAttributesQuery['attributes']>['list'][number]>;

export const useTransformFilters = () => {
    const {lang} = useLang();

    const toValidFilters = (filters: validFiltersArgument): validFilter[] =>
        (filters ?? []).reduce<validFilter[]>((acc, filter) => {
            if (!_isValidFieldFilter(filter)) {
                return acc;
            }
            const _isThroughFilter = filter.field.includes('.');

            if (_isThroughFilter) {
                const [field, subField] = filter.field.split('.');
                const throughFilter: ValidFieldFilterThrough = {
                    field,
                    subField,
                    value: filter.value ?? null,
                    hidden: filter.hidden ?? false,
                    condition: ThroughConditionFilter.THROUGH,
                    subCondition: filter.condition
                };
                acc.push(throughFilter);
            } else {
                acc.push(filter);
            }

            return acc;
        }, []);

    const toExplorerFilters = ({
        filters,
        attributesDataById
    }: {
        filters: validFilter[];
        attributesDataById: ExplorerAttributesById;
    }): ExplorerFilter[] =>
        (filters ?? []).reduce<ExplorerFilter[]>((acc, filter) => {
            if (!attributesDataById[filter.field]) {
                console.warn(`Attribute ${filter.field} from defaultViewSettings or user view not found in database.`);
                return acc;
            }

            const filterAttributeBase: IExplorerFilterBaseAttribute = {
                id: attributesDataById[filter.field].id,
                label: localizedTranslation(attributesDataById[filter.field].label, lang),
                type: attributesDataById[filter.field].type
            };

            // filter is standardFilter
            if (isStandardAttribute(filterAttributeBase.type)) {
                const attributeData = attributesDataById[
                    filter.field
                ];
                if (_isValidFieldFilterStandardValuesList(filter, attributeData)) {
                    const newFilter: IExplorerFilterStandardValueList = {
                        field: filter.field,
                        // TODO : save filter values as string[] when filter and handle fields with libraries
                        value: filter.value ? [filter.value] : [],
                        hidden: filter.hidden ?? false,
                        id: uuid(),
                        condition: (filter.condition as RecordFilterCondition) ?? null,
                        attribute: {
                            ...filterAttributeBase,
                            format: attributeData.format!,
                            valuesList: (attributeData as StandardAttributeDetailsFragment).valuesList!
                        }
                    };
                    acc.push(newFilter);
                } else {
                    const newFilter: IExplorerFilterStandard = {
                        field: filter.field,
                        value: filter.value ?? null,
                        hidden: filter.hidden ?? false,
                        id: uuid(),
                        condition: (filter.condition as RecordFilterCondition) ?? null,
                        attribute: {
                            ...filterAttributeBase,
                            format: attributeData.format!
                        }
                    };
                    acc.push(newFilter);
                }
            }

            if (isLinkAttribute(filterAttributeBase.type)) {
                const attributeData = attributesDataById[
                    filter.field
                ] as AttributeDetailsLinkAttributeWithPermissionsFragment;
                if (_isValidFieldFilterThrough(filter)) {
                    const newFilter: IExplorerFilterThrough = {
                        field: filter.field,
                        value: filter.value ?? null,
                        hidden: filter.hidden ?? false,
                        id: uuid(),
                        condition: filter.condition,
                        attribute: {
                            ...filterAttributeBase,
                            linkedLibrary: attributeData.linked_library!
                        },
                        subCondition: filter.subCondition ?? null,
                        subField: filter.subField
                    };
                    acc.push(newFilter);
                } else if (_isValidFieldFilterLinkValuesList(filter, attributeData)) {
                    const newFilter: IExplorerFilterLinkValueList = {
                        field: filter.field,
                        // TODO : save filter values as string[] when filter and handle fields with libraries
                        value: filter.value ? [filter.value] : [],
                        hidden: filter.hidden ?? false,
                        id: uuid(),
                        condition: filter.condition,
                        attribute: {
                            ...filterAttributeBase,
                            linkedLibrary: attributeData.linked_library!,
                            valuesList: (attributeData as LinkAttributeDetailsFragment).valuesList!
                        }
                    };

                    acc.push(newFilter);
                } else {
                    const newFilter: IExplorerFilterLink = {
                        field: filter.field,
                        value: filter.value ?? null,
                        hidden: filter.hidden ?? false,
                        id: uuid(),
                        condition: filter.condition,
                        attribute: {
                            ...filterAttributeBase,
                            linkedLibrary: attributeData.linked_library!
                        }
                    };

                    acc.push(newFilter);
                }
            }

            if (isTreeAttribute(filterAttributeBase.type) && !_isValidFieldFilterThrough(filter)) {
                const attributeData = attributesDataById[
                    filter.field
                ] as AttributeDetailsTreeAttributeWithPermissionsFragment;
                const newFilter: IExplorerFilterTree = {
                    field: [filter.field],
                    // TODO : save filter values as string[] when tree filter and handle fields with libraries
                    value: filter.value ? [filter.value] : null,
                    hidden: filter.hidden ?? false,
                    id: uuid(),
                    attribute: {
                        ...filterAttributeBase,
                        linkedTree: attributeData.linked_tree!
                    },
                    condition: filter.condition ?? RecordFilterCondition.EQUAL
                };
                acc.push(newFilter);
            }

            return acc;
        }, []);

    return {
        toValidFilters,
        toExplorerFilters
    };
};
