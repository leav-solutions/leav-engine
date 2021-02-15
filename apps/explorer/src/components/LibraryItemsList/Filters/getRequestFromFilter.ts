// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FilterTypes, IFilter, IFilterSeparator, IQueryFilter, OperatorFilter} from '../../../_types/types';
import {AttributeFormat} from './../../../_types/types';

export const getRequestFromFilter = (
    filters: Array<IFilter | IFilterSeparator>,
    filterOperator: OperatorFilter,
    separatorOperator: OperatorFilter
): IQueryFilter[] => {
    let request: IQueryFilter[] = [];

    const hasSeparator = filters.some(filter => filter.type === FilterTypes.separator);
    const firstFilterIsFilterWithValue = filters[0].type === FilterTypes.filter && filters[0].value;

    if (hasSeparator && firstFilterIsFilterWithValue) {
        // Begin first group of filters
        request.push({operator: OperatorFilter.openParent});
    }

    for (const filter of filters) {
        if (
            filter.type === FilterTypes.filter &&
            filter.active &&
            typeof filter.value !== 'undefined' &&
            filter.value !== null
        ) {
            if (filter.operator) {
                request.push({operator: filterOperator});
            }
            request.push({operator: OperatorFilter.openParent});

            const requestValue = _handleValueRequest(filter);
            request = [...request, ...requestValue];

            request.push({operator: OperatorFilter.closeParent});
        } else if (filter.type === FilterTypes.separator && firstFilterIsFilterWithValue) {
            if (
                filter.active &&
                (filters[filter.key + 1] as IFilter)?.active &&
                (filters[filter.key + 1] as IFilter)?.value
            ) {
                // Close last group
                request.push({operator: OperatorFilter.closeParent});

                request.push({operator: separatorOperator});

                // Begin new group
                request.push({operator: OperatorFilter.openParent});
            }
        }
    }
    if (hasSeparator && firstFilterIsFilterWithValue) {
        // Close last group
        request.push({operator: OperatorFilter.closeParent});
    }

    if (!request.some(el => el.value)) {
        request = [];
    }

    return request;
};

const _handleValueRequest = (filter: IFilter) => {
    const result: IQueryFilter[] = [];
    let firstValue = true;

    switch (filter.format) {
        case AttributeFormat.text:
            String(filter.value)
                .split('\n')
                .forEach(filterValue => {
                    if (filterValue) {
                        if (!firstValue) {
                            result.push({operator: OperatorFilter.or});
                        }

                        result.push({
                            field: _getFieldFromFilter(filter),
                            value: filterValue,
                            condition: filter.condition
                        });
                        firstValue = false;
                    }
                });
            break;
        default: {
            result.push({
                field: _getFieldFromFilter(filter),
                value: String(filter.value),
                condition: filter.condition
            });
        }
    }

    return result;
};

const _getFieldFromFilter = (filter: IFilter) => {
    if (filter.originAttributeData) {
        return `${filter.originAttributeData.id}.${filter.attribute.id}`;
    }
    if (filter.extendedData) {
        return `${filter.extendedData.path}`;
    }
    return `${filter.attribute.id}`;
};
