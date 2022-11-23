// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {defaultLinkAttributeFilterFormat} from 'constants/constants';
import {checkTypeIsLink} from 'utils';
import {AttributeType} from '_gqlTypes/globalTypes';
import {
    AttributeConditionFilter,
    FilterType,
    IAttribute,
    IFilter,
    IFilterAttribute,
    IFilterLibrary,
    IFilterTree,
    IQueryFilter,
    TreeConditionFilter
} from '_types/types';

export const getFiltersFromRequest = (
    queryFilters: IQueryFilter[],
    library: string,
    attributes: IAttribute[]
): IFilter[] => {
    let filters: IFilter[] = [];

    for (const queryFilter of queryFilters) {
        const isConditionWithNoValue = queryFilter.condition === 'IS_EMPTY' || queryFilter.condition === 'IS_NOT_EMPTY';
        if (queryFilter.value || isConditionWithNoValue) {
            const splitKey = queryFilter.field.split('.');

            const filter: IFilter = {
                type: queryFilter.condition in TreeConditionFilter ? FilterType.TREE : FilterType.ATTRIBUTE,
                index: filters.length,
                key: queryFilter.field,
                value: !isConditionWithNoValue
                    ? {
                          value:
                              queryFilter.condition === AttributeConditionFilter.BETWEEN
                                  ? JSON.parse(queryFilter.value)
                                  : queryFilter.value
                      }
                    : null,
                active: true,
                condition: AttributeConditionFilter[queryFilter.condition] || TreeConditionFilter[queryFilter.condition]
            };

            // Get root attribute by first key part
            const rootAttribute = attributes.find(attr => attr.library === library && attr.id === splitKey[0]);

            if (rootAttribute) {
                if (rootAttribute.type === AttributeType.simple || rootAttribute.type === AttributeType.advanced) {
                    (filter as IFilterAttribute).attribute = rootAttribute;
                }

                if (checkTypeIsLink(rootAttribute.type)) {
                    const [, linkedAttributeId] = splitKey;
                    if (linkedAttributeId) {
                        const linkedAttribute = attributes.find(
                            attr => attr.library === rootAttribute?.linkedLibrary?.id && attr.id === linkedAttributeId
                        );

                        (filter as IFilterAttribute).attribute = {
                            ...linkedAttribute,
                            parentAttribute: {...rootAttribute, format: defaultLinkAttributeFilterFormat}
                        };
                    } else {
                        (filter as IFilterAttribute).attribute = rootAttribute;
                    }
                }

                if (rootAttribute.type === AttributeType.tree) {
                    const [, libraryId, linkedTreeAttribute] = splitKey;

                    if (!libraryId && !linkedTreeAttribute) {
                        // Only root attribute => search on tree
                        (filter as IFilterAttribute).attribute = {
                            ...rootAttribute,
                            format: defaultLinkAttributeFilterFormat
                        };
                    } else if (libraryId && !linkedTreeAttribute) {
                        // Search on tree library
                        filter.type = FilterType.LIBRARY;
                        (filter as IFilterLibrary).parentAttribute = {
                            ...rootAttribute,
                            format: defaultLinkAttributeFilterFormat
                        };
                        (filter as IFilterLibrary).library = {
                            id: libraryId,
                            label:
                                rootAttribute.linkedTree.libraries.filter(l => l.library.id === libraryId)?.[0].library
                                    .label ?? null
                        };
                    } else {
                        // Search on linked attribute through tree attribute
                        const linkedAttribute = attributes.find(
                            attr => attr.library === libraryId && attr.id === linkedTreeAttribute
                        );

                        (filter as IFilterAttribute).attribute = linkedAttribute;
                        (filter as IFilterAttribute).parentTreeLibrary = {
                            ...filter,
                            type: FilterType.LIBRARY,
                            library: {
                                id: libraryId,
                                label: rootAttribute?.linkedTree?.libraries
                                    ? rootAttribute.linkedTree.libraries.filter(l => l.library.id === libraryId)?.[0]
                                          .library.label
                                    : null
                            },
                            parentAttribute: {...rootAttribute, format: defaultLinkAttributeFilterFormat}
                        };
                    }
                }
            } else if (queryFilter.condition in TreeConditionFilter) {
                (filter as IFilterTree).tree = {id: queryFilter.treeId};
            }

            filters = [...filters, filter];
        }
    }

    return filters;
};
