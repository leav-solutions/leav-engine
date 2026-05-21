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

// --- Shared types ---

type QueryAttributeItem = NonNullable<ExplorerAttributesQuery['attributes']>['list'][number];

type AttributeDetailsLinkAttributeWithPermissionsFragment = AttributeDetailsLinkAttributeFragment & {
    permissions: {access_attribute: boolean};
};
type AttributeDetailsTreeAttributeWithPermissionsFragment = AttributeDetailsTreeAttributeFragment & {
    permissions: {access_attribute: boolean};
};

// --- Type guards ---

const _isValidFieldFilter = (filter: ViewDetailsFilterFragment | UIFilter): filter is ValidFieldFilter =>
    !!filter.field;

const _isValidFieldFilterThrough = (filter: ValidFilter): filter is ValidFieldFilterThrough =>
    filter.condition === ThroughConditionFilter.THROUGH && !!filter.subCondition && !!filter.subField;

const _isValidFieldFilterStandardValuesList = (
    filter: ValidFilter,
    attribute: QueryAttributeItem,
): filter is ValidFieldFilterStandardValuesList & {attribute: StandardAttributeDetailsFragment} =>
    valueListTextConditions.includes(filter.condition as RecordFilterCondition) &&
    [AttributeType.simple, AttributeType.advanced].includes(attribute.type) &&
    'valuesList' in attribute &&
    !!attribute.valuesList?.enable;

const _isValidFieldFilterLinkValuesList = (
    filter: ValidFilter,
    attribute: QueryAttributeItem,
): filter is ValidFieldFilterLinkValuesList & {attribute: LinkAttributeDetailsFragment} =>
    valueListTextConditions.includes(filter.condition as RecordFilterCondition) &&
    [AttributeType.simple_link, AttributeType.advanced_link].includes(attribute.type) &&
    'valuesList' in attribute &&
    !!attribute.valuesList?.enable;

// --- Per-type converters (pure, module-level) ---

const _toStandardUIFilter = (
    filter: ValidFilter,
    attributeData: QueryAttributeItem,
    base: IUIFilterBaseAttribute,
    t: TFunction,
): IUIFilterStandard | IUIFilterStandardValueList => {
    if (_isValidFieldFilterStandardValuesList(filter, attributeData)) {
        const newFilter: IUIFilterStandardValueList = {
            field: filter.field,
            // TODO: save filter values as string[] when filter and handle fields with libraries
            value: filter.value ? [filter.value] : [],
            hidden: filter.hidden ?? false,
            id: window.crypto.randomUUID(),
            condition: (filter.condition as RecordFilterCondition) ?? null,
            attribute: {
                ...base,
                format: attributeData.format!,
                valuesList: (attributeData as StandardAttributeDetailsFragment).valuesList!,
            },
            withEmptyValues: filter.withEmptyValues ?? false,
        };
        return newFilter;
    }

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
            ...base,
            format: attributeData.format!,
            smartFilter: (attributeData as StandardAttributeDetailsFragment).smart_filter ?? undefined,
        },
        withEmptyValues: filter.withEmptyValues ?? false,
    };
    return newFilter;
};

const _toLinkUIFilter = (
    filter: ValidFilter,
    attributeData: AttributeDetailsLinkAttributeWithPermissionsFragment,
    base: IUIFilterBaseAttribute,
): IUIFilterThrough | IUIFilterLinkValueList | IUIFilterLink => {
    if (_isValidFieldFilterThrough(filter)) {
        const newFilter: IUIFilterThrough = {
            field: filter.field,
            value: filter.value ?? null,
            hidden: filter.hidden ?? false,
            id: window.crypto.randomUUID(),
            condition: filter.condition,
            attribute: {
                ...base,
                linkedLibrary: attributeData.linked_library!,
                smartFilter: attributeData.smart_filter ?? undefined,
            },
            subCondition: (filter.subCondition as RecordFilterCondition) ?? null,
            subField: filter.subField,
        };
        return newFilter;
    }

    if (_isValidFieldFilterLinkValuesList(filter, attributeData)) {
        const newFilter: IUIFilterLinkValueList = {
            field: filter.field,
            // TODO: save filter values as string[] when filter and handle fields with libraries
            value: filter.value ? [filter.value] : [],
            hidden: filter.hidden ?? false,
            id: window.crypto.randomUUID(),
            condition: filter.condition,
            attribute: {
                ...base,
                linkedLibrary: attributeData.linked_library!,
                valuesList: (attributeData as LinkAttributeDetailsFragment).valuesList!,
                smartFilter: attributeData.smart_filter ?? undefined,
            },
            withEmptyValues: filter.withEmptyValues ?? false,
        };
        return newFilter;
    }

    const newFilter: IUIFilterLink = {
        field: filter.field,
        value: filter.value ?? null,
        hidden: filter.hidden ?? false,
        id: window.crypto.randomUUID(),
        condition: filter.condition,
        attribute: {
            ...base,
            linkedLibrary: attributeData.linked_library!,
            smartFilter: attributeData.smart_filter ?? undefined,
        },
    };
    return newFilter;
};

const _toTreeUIFilter = (
    filter: ValidFilter,
    attributeData: AttributeDetailsTreeAttributeWithPermissionsFragment,
    base: IUIFilterBaseAttribute,
    treeFilters: ITreeFilters,
): IUIFilterTree => {
    const treeData = treeFilters[filter.field];

    const newFilter: IUIFilterTree = {
        field: [filter.field],
        // TODO: save filter values as string[] when tree filter and handle fields with libraries
        value: filter.value ? [filter.value] : (treeData?.map(tree => tree.value) ?? null),
        formattedValue: filter.value ? [filter.value] : treeData?.map(tree => tree.label),
        nodes: filter.value ? undefined : treeData?.map(tree => ({libraryId: tree.libraryId, nodeId: tree.nodeId})),
        hidden: filter.hidden ?? false,
        id: window.crypto.randomUUID(),
        attribute: {
            ...base,
            linkedTree: attributeData.linked_tree!,
        },
        condition: (filter.condition as RecordFilterCondition) ?? RecordFilterCondition.EQUAL,
        withEmptyValues: filter.withEmptyValues ?? false,
    };
    return newFilter;
};

// --- Public exports ---

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

export type AttributesById = Record<string, QueryAttributeItem>;

export const useTransformFilters = () => {
    const {lang} = useLang();

    const toValidFilters = (filters: ValidFiltersArgument): ValidFilter[] =>
        (filters ?? []).reduce<ValidFilter[]>((acc, filter) => {
            if (!_isValidFieldFilter(filter)) {
                return acc;
            }

            if (filter.field.includes('.')) {
                // Hack: view filters lack the data to transform directly to UI filter —
                // split the field to extract subCondition and subField. May be fixed after LEAVC-569.
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
            const attributeData = attributesDataById[filter.field];
            if (!attributeData) {
                console.warn(`Attribute ${filter.field} from user view not found in database.`);
                return acc;
            }

            const base: IUIFilterBaseAttribute = {
                id: attributeData.id,
                label: localizedTranslation(attributeData.label, lang),
                type: attributeData.type,
            };

            if (isStandardAttribute(base.type)) {
                acc.push(_toStandardUIFilter(filter, attributeData, base, t));
                return acc;
            }

            if (isLinkAttribute(base.type)) {
                const linkAttr = attributeData as AttributeDetailsLinkAttributeWithPermissionsFragment;
                acc.push(_toLinkUIFilter(filter, linkAttr, base));
                return acc;
            }

            if (isTreeAttribute(base.type) && !_isValidFieldFilterThrough(filter)) {
                const treeAttr = attributeData as AttributeDetailsTreeAttributeWithPermissionsFragment;
                acc.push(_toTreeUIFilter(filter, treeAttr, base, treeFilters));
                return acc;
            }

            return acc;
        }, []);

    return {
        toValidFilters,
        toUIFilters,
    };
};
