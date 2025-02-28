// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    AttributeDetailsLinkAttributeFragment,
    ExplorerAttributesQuery,
    ExplorerLinkAttributeQuery,
    GetViewsListQuery,
    LinkAttributeDetailsFragment,
    RecordFilterCondition,
    ViewDetailsFilterFragment
} from '_ui/_gqlTypes';
import {
    ExplorerFilter,
    IExplorerFilterLink,
    IExplorerFilterStandard,
    IExplorerFilterThrough,
    ValidFieldFilter,
    ValidFieldFilterThrough,
    validFilter
} from '../../_types';
import {ThroughConditionFilter} from '_ui/types';
import {isLinkAttribute, isStandardAttribute} from '_ui/_utils/attributeType';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {v4 as uuid} from 'uuid';

export const _isValidFieldFilter = (filter: ViewDetailsFilterFragment | ExplorerFilter): filter is ValidFieldFilter =>
    !!filter.field;

export const _isValidFieldFilterThrough = (
    filter: ValidFieldFilter | ValidFieldFilterThrough
): filter is ValidFieldFilterThrough =>
    filter.condition === ThroughConditionFilter.THROUGH && !!filter.subCondition && !!filter.subField;

export const _isLinkAttributeDetails = (
    linkAttributeData: NonNullable<ExplorerLinkAttributeQuery['attributes']>['list'][number]
): linkAttributeData is LinkAttributeDetailsFragment & {id: string; multiple_values: boolean} =>
    'linked_library' in linkAttributeData;

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

            const filterAttributeBase = {
                label: localizedTranslation(attributesDataById[filter.field].label, lang),
                type: attributesDataById[filter.field].type
            };

            // filter is standardFilter
            if (isStandardAttribute(filterAttributeBase.type)) {
                const newFilter: IExplorerFilterStandard = {
                    field: filter.field,
                    value: filter.value ?? null,
                    id: uuid(),
                    condition: (filter.condition as RecordFilterCondition) ?? null,
                    attribute: {
                        ...filterAttributeBase,
                        format: attributesDataById[filter.field].format!
                    }
                };
                acc.push(newFilter);
            }

            if (isLinkAttribute(filterAttributeBase.type)) {
                const attributeData = attributesDataById[filter.field] as AttributeDetailsLinkAttributeFragment;
                if (_isValidFieldFilterThrough(filter)) {
                    const newFilter: IExplorerFilterThrough = {
                        field: filter.field,
                        value: filter.value ?? null,
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
                } else {
                    const newFilter: IExplorerFilterLink = {
                        field: filter.field,
                        value: filter.value ?? null,
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
            return acc;
        }, []);

    return {
        toValidFilters,
        toExplorerFilters
    };
};
