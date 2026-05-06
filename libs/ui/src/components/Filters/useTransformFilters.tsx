// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type AttributeDetailsLinkAttributeFragment,
    type AttributeDetailsTreeAttributeFragment,
    AttributeFormat,
    AttributeType,
    type ExplorerAttributesQuery,
    type ExplorerLinkAttributeQuery,
    type GetViewsListQuery,
    type LinkAttributeDetailsFragment,
    RecordFilterCondition,
    type StandardAttributeDetailsFragment,
    type ViewDetailsFilterFragment,
} from '_ui/_gqlTypes';
import {
    type UIFilter,
    type IUIFilterBaseAttribute,
    type IUIFilterLink,
    type IUIFilterLinkValueList,
    type IUIFilterStandard,
    type IUIFilterStandardValueList,
    type IUIFilterThrough,
    type IUIFilterTree,
    type ValidFieldFilter,
    type ValidFieldFilterLinkValuesList,
    type ValidFieldFilterStandardValuesList,
    type ValidFieldFilterThrough,
    type ValidFilter,
} from './_types';
import {ThroughConditionFilter} from '_ui/types';
import {isLinkAttribute, isStandardAttribute, isTreeAttribute} from '_ui/_utils/attributeType';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {valueListTextConditions} from './filter-items/filter-type/useConditionOptionsByType';
import dayjs from 'dayjs';
import {type TFunction} from 'i18next';
import {type ITreeFilters} from './context/useGetTreeFilters';

const _isValidFieldFilter = (filter: ViewDetailsFilterFragment | UIFilter): filter is ValidFieldFilter =>
    !!filter.field;

const _isValidFieldFilterThrough = (filter: ValidFilter): filter is ValidFieldFilterThrough =>
    filter.condition === ThroughConditionFilter.THROUGH && !!filter.subCondition && !!filter.subField;

const _isValidFieldFilterStandardValuesList = (
    filter: ValidFilter,
    attribute: NonNullable<ExplorerAttributesQuery['attributes']>['list'][number],
): filter is ValidFieldFilterStandardValuesList & {attribute: StandardAttributeDetailsFragment} =>
    valueListTextConditions.includes(filter.condition as RecordFilterCondition) &&
    [AttributeType.simple, AttributeType.advanced].includes(attribute.type) &&
    'valuesList' in attribute &&
    !!attribute.valuesList?.enable;

const _isValidFieldFilterLinkValuesList = (
    filter: ValidFilter,
    attribute: NonNullable<ExplorerAttributesQuery['attributes']>['list'][number],
): filter is ValidFieldFilterLinkValuesList & {attribute: LinkAttributeDetailsFragment} =>
    valueListTextConditions.includes(filter.condition as RecordFilterCondition) &&
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

export const isLinkAttributeDetails = (
    linkAttributeData: NonNullable<ExplorerLinkAttributeQuery['attributes']>['list'][number],
): linkAttributeData is LinkAttributeDetailsFragment & {
    id: string;
    multiple_values: boolean;
    permissions: {
        access_attribute: boolean;
        edit_value: boolean;
    };
} => 'linked_library' in linkAttributeData;

export type ValidFiltersArgument = GetViewsListQuery['views']['list'][number]['filters'] | UIFilter[];

export type AttributesById = Record<string, NonNullable<ExplorerAttributesQuery['attributes']>['list'][number]>;

export const useTransformFilters = () => {
    const {lang} = useLang();

    const toValidFilters = (filters: ValidFiltersArgument): ValidFilter[] =>
        (filters ?? []).reduce<ValidFilter[]>((acc, filter) => {
            if (!_isValidFieldFilter(filter)) {
                return acc;
            }
            const _isThroughFilter = filter.field.includes('.');

            if (_isThroughFilter) {
                // Hack because view filters does not have the necessary data to be transformed directly to UI filter,
                // we need to split the field to get the subCondition and subField for through filter, may be fix after LEAVC-569
                const [field, ...subFields] = filter.field.split('.');
                const throughFilter: ValidFieldFilterThrough = {
                    field,
                    subField: subFields.join('.'),
                    value: filter.value ?? null,
                    hidden: filter.hidden ?? false,
                    condition: ThroughConditionFilter.THROUGH,
                    subCondition: filter.condition,
                };
                acc.push(throughFilter);
            } else {
                acc.push(filter);
            }

            return acc;
        }, []);

    const toUIFilters = ({
        filters,
        treeFilters,
        attributesDataById,
        t,
    }: {
        filters: ValidFilter[];
        treeFilters: ITreeFilters;
        attributesDataById: AttributesById;
        t: TFunction;
    }): UIFilter[] =>
        (filters ?? []).reduce<UIFilter[]>((acc, filter) => {
            if (!attributesDataById[filter.field]) {
                console.warn(`Attribute ${filter.field} from user view not found in database.`);
                return acc;
            }

            const filterAttributeBase: IUIFilterBaseAttribute = {
                id: attributesDataById[filter.field].id,
                label: localizedTranslation(attributesDataById[filter.field].label, lang),
                type: attributesDataById[filter.field].type,
            };

            // filter is standardFilter
            if (isStandardAttribute(filterAttributeBase.type)) {
                const attributeData = attributesDataById[filter.field];
                if (_isValidFieldFilterStandardValuesList(filter, attributeData)) {
                    const newFilter: IUIFilterStandardValueList = {
                        field: filter.field,
                        // TODO : save filter values as string[] when filter and handle fields with libraries
                        value: filter.value ? [filter.value] : [],
                        hidden: filter.hidden ?? false,
                        id: window.crypto.randomUUID(),
                        condition: (filter.condition as RecordFilterCondition) ?? null,
                        attribute: {
                            ...filterAttributeBase,
                            format: attributeData.format!,
                            valuesList: (attributeData as StandardAttributeDetailsFragment).valuesList!,
                        },
                        withEmptyValues: filter.withEmptyValues ?? false,
                    };
                    acc.push(newFilter);
                } else {
                    let formattedValue: string;
                    if (attributeData.format === AttributeFormat.boolean && filter.value) {
                        formattedValue = filter.value === 'true' ? t('explorer.true') : t('explorer.false');
                    }

                    if (attributeData.format === AttributeFormat.date && filter.value) {
                        formattedValue = dayjs(filter.value).format('YYYY-MM-DD');
                    }

                    const newFilter: IUIFilterStandard = {
                        field: filter.field,
                        value: filter.value ?? null,
                        formattedValue,
                        hidden: filter.hidden ?? false,
                        id: window.crypto.randomUUID(),
                        condition: (filter.condition as RecordFilterCondition) ?? null,
                        attribute: {
                            ...filterAttributeBase,
                            format: attributeData.format!,
                            smartFilter: (attributeData as StandardAttributeDetailsFragment).smart_filter ?? undefined,
                        },
                        withEmptyValues: filter.withEmptyValues ?? false,
                    };
                    acc.push(newFilter);
                }
            }

            if (isLinkAttribute(filterAttributeBase.type)) {
                const attributeData = attributesDataById[
                    filter.field
                ] as AttributeDetailsLinkAttributeWithPermissionsFragment;
                if (_isValidFieldFilterThrough(filter)) {
                    const newFilter: IUIFilterThrough = {
                        field: filter.field,
                        value: filter.value ?? null,
                        hidden: filter.hidden ?? false,
                        id: window.crypto.randomUUID(),
                        condition: filter.condition,
                        attribute: {
                            ...filterAttributeBase,
                            linkedLibrary: attributeData.linked_library!,
                            smartFilter: attributeData.smart_filter ?? undefined,
                        },
                        subCondition: filter.subCondition ?? null,
                        subField: filter.subField,
                    };
                    acc.push(newFilter);
                } else if (_isValidFieldFilterLinkValuesList(filter, attributeData)) {
                    const newFilter: IUIFilterLinkValueList = {
                        field: filter.field,
                        // TODO : save filter values as string[] when filter and handle fields with libraries
                        value: filter.value ? [filter.value] : [],
                        hidden: filter.hidden ?? false,
                        id: window.crypto.randomUUID(),
                        condition: filter.condition,
                        attribute: {
                            ...filterAttributeBase,
                            linkedLibrary: attributeData.linked_library!,
                            valuesList: (attributeData as LinkAttributeDetailsFragment).valuesList!,
                            smartFilter: attributeData.smart_filter ?? undefined,
                        },
                        withEmptyValues: filter.withEmptyValues ?? false,
                    };

                    acc.push(newFilter);
                } else {
                    const newFilter: IUIFilterLink = {
                        field: filter.field,
                        value: filter.value ?? null,
                        hidden: filter.hidden ?? false,
                        id: window.crypto.randomUUID(),
                        condition: filter.condition,
                        attribute: {
                            ...filterAttributeBase,
                            linkedLibrary: attributeData.linked_library!,
                            smartFilter: attributeData.smart_filter ?? undefined,
                        },
                    };

                    acc.push(newFilter);
                }
            }

            if (isTreeAttribute(filterAttributeBase.type) && !_isValidFieldFilterThrough(filter)) {
                const attributeData = attributesDataById[
                    filter.field
                ] as AttributeDetailsTreeAttributeWithPermissionsFragment;
                const newFilter: IUIFilterTree = {
                    field: [filter.field],
                    // TODO : save filter values as string[] when tree filter and handle fields with libraries
                    value: filter.value
                        ? [filter.value]
                        : treeFilters[filter.field]
                          ? treeFilters[filter.field].map(tree => tree.value)
                          : null,
                    formattedValue: filter.value
                        ? [filter.value]
                        : treeFilters[filter.field]
                          ? treeFilters[filter.field].map(tree => tree.label)
                          : undefined,
                    nodes: filter.value
                        ? undefined
                        : treeFilters[filter.field]
                          ? treeFilters[filter.field].map(tree => ({libraryId: tree.libraryId, nodeId: tree.nodeId}))
                          : undefined,
                    hidden: filter.hidden ?? false,
                    id: window.crypto.randomUUID(),
                    attribute: {
                        ...filterAttributeBase,
                        linkedTree: attributeData.linked_tree!,
                    },
                    condition: filter.condition ?? RecordFilterCondition.EQUAL,
                    withEmptyValues: filter.withEmptyValues ?? false,
                };
                acc.push(newFilter);
            }

            return acc;
        }, []);

    return {
        toValidFilters,
        toUIFilters,
    };
};
